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
                'Analisis IA no configurado — falta OPENAI_API_KEY en el servidor.',
                503
            );
        }

        // ── Load couder & interventions ──────────────────────────────
        const couder = await CouderRepository.findById(couderId);
        if (!couder) throw new NotFoundError('Couder not found');

        const interventions = await InterventionRepository.findByCouderId(couderId, periodFilter);
        if (!interventions.length) {
            throw new AppError('No hay intervenciones para el periodo seleccionado', 400);
        }

        // ── Build prompt ─────────────────────────────────────────────
        const historyText = interventions
            .map(i => `[${i.session_date} ${i.session_time}] Interventor: ${i.added_by}\n${i.notes}`)
            .join('\n\n---\n\n');

        const systemPrompt =
            'Eres un asistente clinico especializado en analisis de historial de intervenciones. ' +
            'Responde UNICAMENTE con un objeto JSON valido. Sin markdown, sin texto adicional, sin comentarios. ' +
            'No incluyas emojis ni caracteres especiales.';

        const userPrompt =
            `Analiza el siguiente historial de intervenciones:\n\n` +
            `Historial (${interventions.length} sesiones):\n${historyText}\n\n` +
            `Genera un analisis clinico estructurado con estas tres secciones en espanol:\n` +
            `1. "summary": sintesis general del historial (2-3 oraciones).\n` +
            `2. "diagnosis": mini-diagnostico de la situacion actual (2-3 oraciones).\n` +
            `3. "suggestions": array con 3 a 5 recomendaciones concretas para futuras intervenciones.\n\n` +
            `Responde SOLO con este JSON: { "summary": "...", "diagnosis": "...", "suggestions": ["...", "..."] }`;

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
                throw new AppError('OpenAI devolvio una respuesta vacia', 502);
            }

            // Strip markdown fences if present
            const clean = rawText.replace(/```json|```/gi, '').trim();
            aiResult = JSON.parse(clean);

        } catch (err) {
            if (err instanceof AppError) throw err;
            throw new AppError(`Error al generar analisis IA: ${err.message}`, 502);
        }

        // ── Validate & normalise result ──────────────────────────────
        if (!aiResult.summary || !aiResult.diagnosis || !aiResult.suggestions) {
            throw new AppError('La IA devolvio un analisis incompleto — intenta de nuevo.', 502);
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
