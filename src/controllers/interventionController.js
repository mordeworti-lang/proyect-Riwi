'use strict';

const InterventionService = require('../services/interventionService');

const InterventionController = {
    async getHistory(req, res, next) {
        try {
            const { couderId } = req.params;
            const { from, to, periodLabel } = req.query;
            const periodFilter = from && to ? { from, to } : null;
            const result = await InterventionService.getHistoryForCouder(couderId, periodFilter);
            res.status(200).json({ ok: true, data: result });
        } catch (err) {
            next(err);
        }
    },

    async create(req, res, next) {
        try {
            const { couderId } = req.params;
            const { interventionTypeId, notes, sessionDate, sessionTime } = req.body;
            const userId = req.user.id;
            const intervention = await InterventionService.addIntervention({
                couderId, userId, interventionTypeId, notes, sessionDate, sessionTime,
            });
            res.status(201).json({ ok: true, data: intervention });
        } catch (err) {
            next(err);
        }
    },

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const updated = await InterventionService.updateIntervention(id, req.body);
            res.status(200).json({ ok: true, data: updated });
        } catch (err) {
            next(err);
        }
    },

    async remove(req, res, next) {
        try {
            const { id } = req.params;
            const result = await InterventionService.deleteIntervention(id);
            res.status(200).json({ ok: true, data: result });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = InterventionController;
