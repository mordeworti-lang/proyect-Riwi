'use strict';

const DashboardService = require('../services/dashboardService');

const DashboardController = {
    async global(req, res, next) {
        try {
            const data = await DashboardService.getGlobalDashboard();
            res.status(200).json({ ok: true, data });
        } catch (err) {
            next(err);
        }
    },

    async cohortsBySede(req, res, next) {
        try {
            const data = await DashboardService.getCohortsBySede(req.params.sedeId);
            res.status(200).json({ ok: true, data });
        } catch (err) {
            next(err);
        }
    },

    async clansByCohort(req, res, next) {
        try {
            const data = await DashboardService.getClansByCohort(req.params.cohortId);
            res.status(200).json({ ok: true, data });
        } catch (err) {
            next(err);
        }
    },

    async clanDetail(req, res, next) {
        try {
            const data = await DashboardService.getClanDetail(req.params.clanId);
            res.status(200).json({ ok: true, data });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = DashboardController;
