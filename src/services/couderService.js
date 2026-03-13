'use strict';

const CouderRepository = require('../repositories/couderRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const ValidationError = require('../exceptions/ValidationError');

const CouderService = {
    async searchByNationalId(nationalId) {
        if (!nationalId || String(nationalId).trim() === '') {
            throw new ValidationError('National ID (CC) is required');
        }
        const couder = await CouderRepository.findByNationalId(String(nationalId).trim());
        if (!couder) throw new NotFoundError(`Couder with CC "${nationalId}" not found`);
        return couder;
    },

    async getById(id) {
        const numId = parseInt(id, 10);
        if (!numId || numId < 1) throw new ValidationError('Invalid couder ID');
        const couder = await CouderRepository.findById(numId);
        if (!couder) throw new NotFoundError('Couder not found');
        return couder;
    },

    async getCoudersByClan(clanId) {
        return CouderRepository.findByClanId(clanId);
    },
};

module.exports = CouderService;
