'use strict';

jest.mock('../src/repositories/interventionRepository');
jest.mock('../src/repositories/couderRepository');

const InterventionService    = require('../src/services/interventionService');
const InterventionRepository = require('../src/repositories/interventionRepository');
const CouderRepository       = require('../src/repositories/couderRepository');
const NotFoundError          = require('../src/exceptions/NotFoundError');
const ValidationError        = require('../src/exceptions/ValidationError');

const mockCouder = { id: 1, full_name: 'Test', national_id: '123' };
const mockIntervention = {
    id: 10, couder_id: 1, notes: 'Note text',
    session_date: '2024-01-14', session_time: '10:00',
    intervention_type: 'follow_up', added_by: 'Lili'
};

describe('InterventionService', () => {
    beforeEach(() => jest.clearAllMocks());

    test('getHistoryForCouder throws NotFoundError if couder missing', async () => {
        CouderRepository.findById.mockResolvedValue(null);
        await expect(InterventionService.getHistoryForCouder(999)).rejects.toBeInstanceOf(NotFoundError);
    });

    test('getHistoryForCouder returns couder and interventions', async () => {
        CouderRepository.findById.mockResolvedValue(mockCouder);
        InterventionRepository.findByCouderId.mockResolvedValue([mockIntervention]);
        const result = await InterventionService.getHistoryForCouder(1);
        expect(result.couder).toEqual(mockCouder);
        expect(result.interventions).toHaveLength(1);
    });

    test('addIntervention throws ValidationError if required fields missing', async () => {
        await expect(InterventionService.addIntervention({ couderId: 1 }))
            .rejects.toBeInstanceOf(ValidationError);
    });

    test('addIntervention throws NotFoundError if couder not found', async () => {
        CouderRepository.findById.mockResolvedValue(null);
        await expect(InterventionService.addIntervention({
            couderId: 999, userId: 1, interventionTypeId: 1,
            notes: 'Test', sessionDate: '2024-01-14', sessionTime: '10:00'
        })).rejects.toBeInstanceOf(NotFoundError);
    });

    test('addIntervention creates and returns intervention', async () => {
        CouderRepository.findById.mockResolvedValue(mockCouder);
        InterventionRepository.create.mockResolvedValue(mockIntervention);
        const result = await InterventionService.addIntervention({
            couderId: 1, userId: 1, interventionTypeId: 1,
            notes: 'New note', sessionDate: '2024-02-01', sessionTime: '09:00'
        });
        expect(result.notes).toBe('Note text');
        expect(InterventionRepository.create).toHaveBeenCalledTimes(1);
    });

    test('deleteIntervention throws NotFoundError if not found', async () => {
        InterventionRepository.delete.mockResolvedValue(false);
        await expect(InterventionService.deleteIntervention(999)).rejects.toBeInstanceOf(NotFoundError);
    });

    test('deleteIntervention returns deleted:true on success', async () => {
        InterventionRepository.delete.mockResolvedValue(true);
        const result = await InterventionService.deleteIntervention(10);
        expect(result.deleted).toBe(true);
    });
});
