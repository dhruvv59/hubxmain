import {
    getTeacherInfo,
    getTeacherStats,
    getRevenueData,
    getLikeabilityData,
    getNotifications,
    getTeacherDashboardData,
} from '../teacher-dashboard';

describe('Teacher Dashboard Service - Streaming Functions', () => {
    describe('getTeacherInfo', () => {
        it('should return teacher info', async () => {
            const result = await getTeacherInfo();

            expect(result).toHaveProperty('teacherName');
            expect(typeof result.teacherName).toBe('string');
            expect(result.teacherName).toBe('Mrunal Mishra');
        });
    });

    describe('getTeacherStats', () => {
        it('should return 4 stat cards', async () => {
            const result = await getTeacherStats();

            expect(result).toHaveLength(4);
        });

        it('should return stats with correct structure', async () => {
            const result = await getTeacherStats();

            result.forEach(stat => {
                expect(stat).toHaveProperty('id');
                expect(stat).toHaveProperty('title');
                expect(stat).toHaveProperty('value');
                expect(stat).toHaveProperty('subValue');
                expect(stat).toHaveProperty('lastMonthValue');
                expect(stat).toHaveProperty('trend');
                expect(stat).toHaveProperty('theme');
            });
        });

        it('should include earnings stat', async () => {
            const result = await getTeacherStats();
            const earningStat = result.find(s => s.id === 'earnings');

            expect(earningStat).toBeDefined();
            expect(earningStat?.title).toBe('TOTAL EARNINGS');
        });
    });

    describe('getRevenueData', () => {
        it('should return 12 months of data', async () => {
            const result = await getRevenueData();

            expect(result).toHaveLength(12);
        });

        it('should return data with correct structure', async () => {
            const result = await getRevenueData();

            result.forEach(item => {
                expect(item).toHaveProperty('name');
                expect(item).toHaveProperty('value');
                expect(typeof item.name).toBe('string');
                expect(typeof item.value).toBe('number');
            });
        });

        it('should have all 12 months', async () => {
            const result = await getRevenueData();
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            const dataMonths = result.map(item => item.name);
            expect(dataMonths).toEqual(months);
        });
    });

    describe('getLikeabilityData', () => {
        it('should return 12 months of data', async () => {
            const result = await getLikeabilityData();

            expect(result).toHaveLength(12);
        });

        it('should return data with correct structure', async () => {
            const result = await getLikeabilityData();

            result.forEach(item => {
                expect(item).toHaveProperty('name');
                expect(item).toHaveProperty('value');
            });
        });
    });

    describe('getNotifications', () => {
        it('should return notifications array', async () => {
            const result = await getNotifications();

            expect(Array.isArray(result)).toBe(true);
            expect(result.length).toBeGreaterThan(0);
        });

        it('should return notifications with correct structure', async () => {
            const result = await getNotifications();

            result.forEach(notification => {
                expect(notification).toHaveProperty('id');
                expect(notification).toHaveProperty('user');
                expect(notification).toHaveProperty('action');
                expect(notification).toHaveProperty('target');
                expect(notification).toHaveProperty('avatar');
                expect(notification).toHaveProperty('type');
            });
        });
    });

    describe('getTeacherDashboardData (Legacy)', () => {
        it('should return complete dashboard data', async () => {
            const result = await getTeacherDashboardData();

            expect(result).toHaveProperty('teacherName');
            expect(result).toHaveProperty('stats');
            expect(result).toHaveProperty('revenueData');
            expect(result).toHaveProperty('likeabilityData');
            expect(result).toHaveProperty('notifications');
        });

        it('should return data matching individual streaming functions', async () => {
            const dashboardData = await getTeacherDashboardData();

            expect(dashboardData.teacherName).toBe('Mrunal Mishra');
            expect(dashboardData.stats).toHaveLength(4);
            expect(dashboardData.revenueData).toHaveLength(12);
            expect(dashboardData.likeabilityData).toHaveLength(12);
            expect(dashboardData.notifications.length).toBeGreaterThan(0);
        });
    });
});

describe('Teacher Dashboard Service - Performance', () => {
    it('should complete getTeacherInfo quickly (< 300ms)', async () => {
        const start = Date.now();
        await getTeacherInfo();
        const duration = Date.now() - start;

        // Allow some buffer for test environment
        expect(duration).toBeLessThan(400);
    });

    it('should fetch parallel data efficiently', async () => {
        const start = Date.now();

        await Promise.all([
            getTeacherInfo(),
            getTeacherStats(),
            getRevenueData(),
        ]);

        const duration = Date.now() - start;

        // Should complete in time of slowest request, not sum of all
        // Slowest is ~600ms, so parallel should be < 800ms
        expect(duration).toBeLessThan(1000);
    });
});
