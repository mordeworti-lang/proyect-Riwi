'use strict';

jest.mock('../src/repositories/couderRepository');

const CouderService    = require('../src/services/couderService');
const CouderRepository = require('../src/repositories/couderRepository');
const NotFoundError    = require('../src/exceptions/NotFoundError');
const ValidationError  = require('../src/exceptions/ValidationError');

const mockCouder = {
    id: 1, national_id: '1001234567', full_name: 'Juan Pérez',
    status: 'active', clan_name: 'Clan A', route_name: 'basica'
};

describe('CouderService', () => {
    beforeEach(() => jest.clearAllMocks());

    test('searchByNationalId throws ValidationError for empty CC', async () => {
        await expect(CouderService.searchByNationalId('')).rejects.toBeInstanceOf(ValidationError);
    });

    test('searchByNationalId throws NotFoundError when couder not found', async () => {
        CouderRepository.findByNationalId.mockResolvedValue(null);
        await expect(CouderService.searchByNationalId('9999999')).rejects.toBeInstanceOf(NotFoundError);
    });

    test('searchByNationalId returns couder on success', async () => {
        CouderRepository.findByNationalId.mockResolvedValue(mockCouder);
        const result = await CouderService.searchByNationalId('1001234567');
        expect(result.national_id).toBe('1001234567');
    });

    test('getById throws NotFoundError when not found', async () => {
        CouderRepository.findById.mockResolvedValue(null);
        await expect(CouderService.getById(999)).rejects.toBeInstanceOf(NotFoundError);
    });

    test('getCoudersByClan returns list from repository', async () => {
        CouderRepository.findByClanId.mockResolvedValue([mockCouder]);
        const list = await CouderService.getCoudersByClan(1);
        expect(list).toHaveLength(1);
        expect(list[0].full_name).toBe('Juan Pérez');
    });
});
