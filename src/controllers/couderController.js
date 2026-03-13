'use strict';

const CouderService = require('../services/couderService');

const CouderController = {
    async searchByCC(req, res, next) {
        try {
            const { cc } = req.query;
            const couder = await CouderService.searchByNationalId(cc);
            res.status(200).json({ ok: true, data: couder });
        } catch (err) {
            next(err);
        }
    },

    async getById(req, res, next) {
        try {
            const couder = await CouderService.getById(req.params.id);
            res.status(200).json({ ok: true, data: couder });
        } catch (err) {
            next(err);
        }
    },
};

module.exports = CouderController;
