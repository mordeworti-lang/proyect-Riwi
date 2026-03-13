'use strict';

const InterventionRepository = require('../repositories/interventionRepository');
const CouderRepository = require('../repositories/couderRepository');
const NotFoundError = require('../exceptions/NotFoundError');
const ValidationError = require('../exceptions/ValidationError');

const InterventionService = {
    async getHistoryForCouder(couderId, periodFilter = null) {
        const couder = await CouderRepository.findById(couderId);
        if (!couder) throw new NotFoundError('Couder not found');
        const interventions = await InterventionRepository.findByCouderId(couderId, periodFilter);
        return { couder, interventions };
    },

    async addIntervention({ couderId, userId, interventionTypeId, notes, sessionDate, sessionTime }) {
        const typeId = parseInt(interventionTypeId, 10);
        if (!couderId || !userId || !typeId || !notes || !sessionDate || !sessionTime) {
            throw new ValidationError('All intervention fields are required');
        }
        if (isNaN(typeId) || typeId < 1) {
            throw new ValidationError('Invalid intervention type');
        }
        const couder = await CouderRepository.findById(couderId);
        if (!couder) throw new NotFoundError('Couder not found');

        return InterventionRepository.create({
            couderId, userId,
            interventionTypeId: typeId,
            notes, sessionDate, sessionTime,
        });
    },

    async updateIntervention(id, { notes, sessionDate, sessionTime, interventionTypeId }) {
        if (!notes && !sessionDate && !sessionTime && !interventionTypeId) {
            throw new ValidationError('At least one field is required to update');
        }
        const existing = await InterventionRepository.findById(id);
        if (!existing) throw new NotFoundError('Intervention not found');

        const typeId = interventionTypeId
            ? parseInt(interventionTypeId, 10)
            : existing.intervention_type_id;

        // Merge: keep existing values for any field not provided
        return InterventionRepository.update(id, {
            notes:               notes       ?? existing.notes,
            sessionDate:         sessionDate ?? existing.session_date,
            sessionTime:         sessionTime ?? existing.session_time,
            interventionTypeId:  typeId,
        });
    },

    async deleteIntervention(id) {
        const deleted = await InterventionRepository.delete(id);
        if (!deleted) throw new NotFoundError('Intervention not found');
        return { deleted: true };
    },
};

module.exports = InterventionService;
