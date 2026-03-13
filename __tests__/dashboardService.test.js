'use strict';

jest.mock('../src/repositories/sedeRepository');
jest.mock('../src/repositories/cohortRepository');
jest.mock('../src/repositories/clanRepository');
jest.mock('../src/repositories/couderRepository');

const DashboardService  = require('../src/services/dashboardService');
const SedeRepository    = require('../src/repositories/sedeRepository');
const CohortRepository  = require('../src/repositories/cohortRepository');
const ClanRepository    = require('../src/repositories/clanRepository');
const CouderRepository  = require('../src/repositories/couderRepository');
const NotFoundError     = require('../src/exceptions/NotFoundError');

describe('DashboardService', () => {
    beforeEach(() => jest.clearAllMocks());

    test('getGlobalDashboard returns global stats and sedes', async () => {
        SedeRepository.findAll.mockResolvedValue([{ id: 1, name: 'Medellín' }]);
        SedeRepository.globalStats.mockResolvedValue({ total: '100', active: '80', withdrawn: '10', completed: '10' });
        CouderRepository.statsBySede.mockResolvedValue({ total: '50', active: '40', withdrawn: '5', completed: '5' });
        CouderRepository.attendedCountBySede.mockResolvedValue(30);
        CohortRepository.findBySedeId.mockResolvedValue([{ id: 1, name: 'Corte 1' }]);
        CouderRepository.statsByCohort.mockResolvedValue({ total: '25', active: '20', withdrawn: '3', completed: '2' });
        CouderRepository.attendedCountByCohort.mockResolvedValue(15);
        ClanRepository.findByCohortId.mockResolvedValue([{ id: 1, name: 'Clan A' }]);
        CouderRepository.statsByClan.mockResolvedValue({ total: '10', active: '8', withdrawn: '1', completed: '1' });
        CouderRepository.attendedCountByClan.mockResolvedValue(5);
        ClanRepository.averageScore.mockResolvedValue(4.5);

        const result = await DashboardService.getGlobalDashboard();
        expect(result.global.total).toBe(100);
        expect(result.sedes).toHaveLength(1);
        expect(result.sedes[0].attendancePercent).toBe(60);
    });

    test('getCohortsBySede throws NotFoundError for unknown sede', async () => {
        SedeRepository.findById.mockResolvedValue(null);
        await expect(DashboardService.getCohortsBySede(999)).rejects.toBeInstanceOf(NotFoundError);
    });

    test('getClansByCohort throws NotFoundError for unknown cohort', async () => {
        CohortRepository.findById.mockResolvedValue(null);
        await expect(DashboardService.getClansByCohort(999)).rejects.toBeInstanceOf(NotFoundError);
    });

    test('getClanDetail throws NotFoundError for unknown clan', async () => {
        ClanRepository.findById.mockResolvedValue(null);
        await expect(DashboardService.getClanDetail(999)).rejects.toBeInstanceOf(NotFoundError);
    });

    test('getClanDetail returns clan stats and couder list', async () => {
        ClanRepository.findById.mockResolvedValue({ id: 1, name: 'Clan A', shift: 'morning' });
        CouderRepository.statsByClan.mockResolvedValue({ total: '40', active: '27', withdrawn: '13', completed: '0' });
        ClanRepository.averageScore.mockResolvedValue(4.9);
        CouderRepository.findByClanId.mockResolvedValue([{ id: 1, full_name: 'Test' }]);
        CouderRepository.attendedCountByClan.mockResolvedValue(20);

        const result = await DashboardService.getClanDetail(1);
        expect(result.clan.total).toBe(40);
        expect(result.clan.avgScore).toBe(4.9);
        expect(result.couders).toHaveLength(1);
        expect(result.clan.attendancePercent).toBe(50);
    });
});
