'use strict';

const SedeRepository = require('../repositories/sedeRepository');
const CohortRepository = require('../repositories/cohortRepository');
const ClanRepository = require('../repositories/clanRepository');
const CouderRepository = require('../repositories/couderRepository');
const NotFoundError = require('../exceptions/NotFoundError');

const DashboardService = {
    /** Global stats: totals + per-sede breakdown */
    async getGlobalDashboard() {
        const [sedes, globalStats] = await Promise.all([
            SedeRepository.findAll(),
            SedeRepository.globalStats(),
        ]);

        const sedeStats = await Promise.all(
            sedes.map(async (sede) => {
                const stats = await CouderRepository.statsBySede(sede.id);
                const attended = await CouderRepository.attendedCountBySede(sede.id);
                const total = parseInt(stats.total, 10) || 0;
                
                // Obtener cohorts de esta sede
                const cohorts = await CohortRepository.findBySedeId(sede.id);
                const cohortsWithStats = await Promise.all(
                    cohorts.map(async (cohort) => {
                        const cohortStats = await CouderRepository.statsByCohort(cohort.id);
                        const cohortAttended = await CouderRepository.attendedCountByCohort(cohort.id);
                        const cohortTotal = parseInt(cohortStats.total, 10) || 0;
                        
                        // Obtener clans de este cohort
                        const clans = await ClanRepository.findByCohortId(cohort.id);
                        const clansWithStats = await Promise.all(
                            clans.map(async (clan) => {
                                const clanStats = await CouderRepository.statsByClan(clan.id);
                                const clanAttended = await CouderRepository.attendedCountByClan(clan.id);
                                const clanTotal = parseInt(clanStats.total, 10) || 0;
                                const avgScore = await ClanRepository.averageScore(clan.id);
                                
                                return {
                                    ...clan,
                                    total: clanTotal,
                                    active: parseInt(clanStats.active, 10),
                                    withdrawn: parseInt(clanStats.withdrawn, 10),
                                    completed: parseInt(clanStats.completed, 10),
                                    attended: clanAttended,
                                    attendancePercent: clanTotal ? Math.round((clanAttended / clanTotal) * 100) : 0,
                                    avgScore,
                                };
                            })
                        );
                        
                        return {
                            ...cohort,
                            total: cohortTotal,
                            active: parseInt(cohortStats.active, 10),
                            withdrawn: parseInt(cohortStats.withdrawn, 10),
                            completed: parseInt(cohortStats.completed, 10),
                            attended: cohortAttended,
                            attendancePercent: cohortTotal ? Math.round((cohortAttended / cohortTotal) * 100) : 0,
                            clans: clansWithStats,
                        };
                    })
                );
                
                return {
                    ...sede,
                    total,
                    active:    parseInt(stats.active, 10),
                    withdrawn: parseInt(stats.withdrawn, 10),
                    completed: parseInt(stats.completed, 10),
                    attended,
                    attendancePercent: total ? Math.round((attended / total) *100) : 0,
                    cohorts: cohortsWithStats,
                };
            })
        );

        return {
            global: {
                total:     parseInt(globalStats.total, 10),
                active:    parseInt(globalStats.active, 10),
                withdrawn: parseInt(globalStats.withdrawn, 10),
                completed: parseInt(globalStats.completed, 10),
            },
            sedes: sedeStats,
        };
    },

    /** Cohorts for a sede with stats */
    async getCohortsBySede(sedeId) {
        const sede = await SedeRepository.findById(sedeId);
        if (!sede) throw new NotFoundError('Sede not found');

        const cohorts = await CohortRepository.findBySedeId(sedeId);

        const cohortStats = await Promise.all(
            cohorts.map(async (cohort) => {
                const stats = await CouderRepository.statsByCohort(cohort.id);
                const attended = await CouderRepository.attendedCountByCohort(cohort.id);
                const total = parseInt(stats.total, 10) || 0;
                return {
                    ...cohort,
                    total,
                    active:    parseInt(stats.active, 10),
                    withdrawn: parseInt(stats.withdrawn, 10),
                    completed: parseInt(stats.completed, 10),
                    attended,
                    attendancePercent: total ? Math.round((attended / total) * 100) : 0,
                };
            })
        );

        return { sede, cohorts: cohortStats };
    },

    /** Clans for a cohort with stats, grouped by shift */
    async getClansByCohort(cohortId) {
        const cohort = await CohortRepository.findById(cohortId);
        if (!cohort) throw new NotFoundError('Cohort not found');

        const clans = await ClanRepository.findByCohortId(cohortId);

        const clanStats = await Promise.all(
            clans.map(async (clan) => {
                const stats = await CouderRepository.statsByClan(clan.id);
                const attended = await CouderRepository.attendedCountByClan(clan.id);
                const avgScore = await ClanRepository.averageScore(clan.id);
                const total = parseInt(stats.total, 10) || 0;
                return {
                    ...clan,
                    total,
                    active:    parseInt(stats.active, 10),
                    withdrawn: parseInt(stats.withdrawn, 10),
                    completed: parseInt(stats.completed, 10),
                    attended,
                    attendancePercent: total ? Math.round((attended / total) * 100) : 0,
                    avgScore,
                };
            })
        );

        const morning = clanStats.filter(c => c.shift === 'morning');
        const afternoon = clanStats.filter(c => c.shift === 'afternoon');

        return { cohort, morning, afternoon };
    },

    /** Clan detail with couder list */
    async getClanDetail(clanId) {
        const clan = await ClanRepository.findById(clanId);
        if (!clan) throw new NotFoundError('Clan not found');

        const [stats, avgScore, couders, attended] = await Promise.all([
            CouderRepository.statsByClan(clanId),
            ClanRepository.averageScore(clanId),
            CouderRepository.findByClanId(clanId),
            CouderRepository.attendedCountByClan(clanId),
        ]);

        const total = parseInt(stats.total, 10) || 0;
        return {
            clan: {
                ...clan,
                avgScore,
                total,
                active:    parseInt(stats.active, 10),
                withdrawn: parseInt(stats.withdrawn, 10),
                completed: parseInt(stats.completed, 10),
                attended,
                attendancePercent: total ? Math.round((attended / total) * 100) : 0,
            },
            couders,
        };
    },
};

module.exports = DashboardService;
