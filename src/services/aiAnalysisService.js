'use strict';

const AiAnalysisRepository  = require('../repositories/aiAnalysisRepository');
const InterventionRepository = require('../repositories/interventionRepository');
const CouderRepository       = require('../repositories/couderRepository');
const NotFoundError          = require('../exceptions/NotFoundError');
const AppError               = require('../exceptions/AppError');

// ── OpenAI config ──────────────────────────────────────────────────────────
// Model: gpt-3.5-turbo (lowest cost version)
// API: v1/chat/completions (OpenAI Chat Completions API)
// Key: OPENAI_API_KEY from environment — NEVER hardcoded, NEVER logged
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL   = 'gpt-3.5-turbo';

function getApiKey() {
    return process.env.OPENAI_API_KEY || '';
}

const AiAnalysisService = {
    /**
     * Generate an AI analysis for a couder's clinical history.
     * Uses OpenAI gpt-3.5-turbo via the v1/chat/completions endpoint.
     *
     * Security:
     *  - API key comes exclusively from process.env (OPENAI_API_KEY).
     *  - Key is NEVER exposed to the frontend or logged.
     *  - Request is made server-side only (this file runs in Node.js).
     *  - Only processes intervention history (dates, times, who intervened).
     */
    async generateAnalysis(couderId, periodFilter = null, periodLabel = 'all') {
        const apiKey = getApiKey();
        if (!apiKey) {
            throw new AppError(
                'AI analysis not configured — missing OPENAI_API_KEY on server.',
                503
            );
        }

        // ── Load couder & interventions ──────────────────────────────
        const couder = await CouderRepository.findById(couderId);
        if (!couder) throw new NotFoundError('Couder not found');

        const interventions = await InterventionRepository.findByCouderId(couderId, periodFilter);
        if (!interventions.length) {
            throw new AppError('No interventions found for the selected period', 400);
        }

        // ── Build prompt ─────────────────────────────────────────────
        const historyText = interventions
            .map(i => `DATE: ${i.session_date} TIME: ${i.session_time}\nTYPE: ${i.intervention_type}\nINTERVENTOR: ${i.added_by}\nNOTES: ${i.notes}`)
            .join('\n\n---\n\n');

        const systemPrompt =
            'You are a clinical assistant specialized in intervention history analysis. ' +
            'Respond ONLY with a valid JSON object. No markdown, no additional text, no comments. ' +
            'Do not include emojis or special characters.';

        const userPrompt =
            `Analyze the following intervention history for a couder:\n\n` +
            `History (${interventions.length} sessions):\n${historyText}\n\n` +
            `Generate a structured clinical analysis with these three sections in English:\n` +
            `1. "summary": general synthesis of the couder's history including key dates and chronological evolution (3-4 sentences).\n` +
            `2. "diagnosis": mini-diagnosis of the couder's current situation based on temporal evolution (2-3 sentences).\n` +
            `3. "suggestions": array with 3 to 5 concrete recommendations for future interventions with the couder.\n\n` +
            `IMPORTANT: In the summary, mention important dates, intervention frequency, and observed temporal patterns for the couder.\n` +
            `Respond ONLY with this JSON: { "summary": "...", "diagnosis": "...", "suggestions": ["...", "..."] }`;

        // ── Call OpenAI API ───────────────────────────────────────
        let aiResult;
        try {
            const response = await fetch(OPENAI_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: OPENAI_MODEL,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt },
                    ],
                    temperature: 0.3,
                    max_tokens: 1024,
                }),
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new AppError(`OpenAI API error (${response.status}): ${errText}`, 502);
            }

            const data = await response.json();

            // OpenAI response: content is in choices[0].message.content
            const rawText = data?.choices?.[0]?.message?.content;
            if (!rawText) {
                throw new AppError('OpenAI returned an empty response', 502);
            }

            // Strip markdown fences if present
            const clean = rawText.replace(/```json|```/gi, '').trim();
            aiResult = JSON.parse(clean);

        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(`Error generating AI analysis: ${err.message}`, 502);
        }

        // ── Validate & normalise result ──────────────────────────────
        if (!aiResult.summary || !aiResult.diagnosis || !aiResult.suggestions) {
            throw new AppError('AI returned incomplete analysis — please try again.', 502);
        }

        const suggestions = Array.isArray(aiResult.suggestions)
            ? aiResult.suggestions
            : String(aiResult.suggestions).split('\n').filter(Boolean);

        // ── Persist to ai_analyses table (PostgreSQL) ────────────────
        const saved = await AiAnalysisRepository.save({
            couderId,
            periodLabel,
            summary:     aiResult.summary,
            diagnosis:   aiResult.diagnosis,
            suggestions,
        });

        return saved;
    },

    async getAnalysesForCouder(couderId) {
        const couder = await CouderRepository.findById(couderId);
        if (!couder) throw new NotFoundError('Couder not found');
        return AiAnalysisRepository.findByCouderId(couderId);
    },
};

module.exports = AiAnalysisService;
