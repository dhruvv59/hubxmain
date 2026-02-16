import React from 'react';
import { Metadata } from 'next';
import { TeacherNotificationsView } from '@/components/teacher/notifications/TeacherNotificationsView';

export const metadata: Metadata = {
    title: 'Notifications | Teacher Dashboard',
    description: 'View and manage all your notifications from students and the system',
};

export default function TeacherNotificationsPage() {
    return <TeacherNotificationsView />;
}
