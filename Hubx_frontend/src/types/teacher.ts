
// --- Teacher Dashboard Types ---

export type TrendDirection = 'up' | 'down';
export type CardTheme = 'green' | 'orange' | 'purple' | 'yellow';

export interface DashboardStat {
    id: string;
    title: string;
    value: string;
    subValue: string;
    lastMonthValue: string;
    trend: TrendDirection;
    theme: CardTheme;
}

export interface ChartDataPoint {
    name: string;
    value: number;
}

export interface NotificationItem {
    id: number;
    user: string;
    action: string;
    target: string;
    avatar: string;
    type: string;
}

export interface TeacherDashboardData {
    teacherName: string;
    stats: DashboardStat[];
    revenueData: ChartDataPoint[];
    likeabilityData: ChartDataPoint[];
    notifications: NotificationItem[];
}
