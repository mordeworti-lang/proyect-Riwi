'use strict';

const AiAnalysisService = require('../services/aiAnalysisService');

const AiAnalysisController = {
    async generate(req, res, next) {
        try {
            const { couderId } = req.params;
            const { from, to, periodLabel = 'all' } = req.body;
            const periodFilter = from && to ? { from, to } : null;
            const result = await AiAnalysisService.generateAnalysis(couderId, periodFilter, periodLabel);
            res.status(201).json({ ok: true, data: result });
        } catch (err) {
            next(err);
        }
    },

    async getHistory(req, res, next) {
        try {
            const { couderId } = req.params;
            const analyses = await AiAnalysisService.getAnalysesForCouder(couderId);
            res.status(200).json({ ok: true, data: analyses });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = AiAnalysisController;
