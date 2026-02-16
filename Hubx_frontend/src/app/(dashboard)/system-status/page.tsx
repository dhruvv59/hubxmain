"use client";

import React, { useEffect, useState } from "react";
import { systemStatusService } from "@/services/system-status";
import type { SystemStatusData, ModuleHealth, ModuleStatus } from "@/types/system-status";
import { Loader2, CheckCircle, AlertCircle, XCircle, RefreshCw } from "lucide-react";

export default function SystemStatusPage() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<SystemStatusData | null>(null);

    useEffect(() => {
        loadStatus();
    }, []);

    const loadStatus = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await systemStatusService.getStatus();
            setStatus(response.data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Unable to load system status';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (moduleStatus: ModuleStatus) => {
        switch (moduleStatus) {
            case 'connected':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'not_configured':
                return <AlertCircle className="h-5 w-5 text-yellow-600" />;
            case 'issue':
                return <XCircle className="h-5 w-5 text-red-600" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-400" />;
        }
    };

    const getStatusBadgeClass = (moduleStatus: ModuleStatus) => {
        switch (moduleStatus) {
            case 'connected':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'not_configured':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'issue':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (moduleStatus: ModuleStatus) => {
        switch (moduleStatus) {
            case 'connected':
                return 'Connected';
            case 'not_configured':
                return 'Not Configured';
            case 'issue':
                return 'Issue Detected';
            default:
                return 'Unknown';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 text-indigo-600 animate-spin mx-auto" />
                    <p className="mt-4 text-gray-600">Loading system status...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                        <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-red-900">Unable to Load System Status</h2>
                            <p className="text-red-700 mt-2">{error}</p>
                            <button
                                onClick={loadStatus}
                                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors inline-flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!status) return null;

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
                <p className="mt-2 text-gray-600">
                    Real-time monitoring of all system modules and services
                </p>
            </div>

            {/* Overall Status Card */}
            <div className={`rounded-xl p-6 border-2 ${status.overall === 'ready'
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
                }`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {status.overall === 'ready' ? (
                            <CheckCircle className="h-12 w-12 text-green-600" />
                        ) : (
                            <AlertCircle className="h-12 w-12 text-yellow-600" />
                        )}
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Overall System Status</h2>
                            <p className="mt-1 text-lg">{status.message}</p>
                        </div>
                    </div>
                    <div className={`text-3xl font-bold uppercase ${status.overall === 'ready' ? 'text-green-700' : 'text-yellow-700'
                        }`}>
                        {status.overall === 'ready' ? 'READY' : 'ACTION REQUIRED'}
                    </div>
                </div>
            </div>

            {/* Module Health List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Connection & Module Health</h2>
                    <p className="text-sm text-gray-500 mt-1">Status of all critical system modules</p>
                </div>
                <div className="divide-y divide-gray-200">
                    {status.modules.map((module: ModuleHealth) => (
                        <div key={module.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-4">
                                {getStatusIcon(module.status)}
                                <div>
                                    <h3 className="font-medium text-gray-900">{module.label}</h3>
                                    <p className="text-sm text-gray-600 mt-0.5">{module.message}</p>
                                </div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusBadgeClass(module.status)}`}>
                                {getStatusLabel(module.status)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Admin Explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-3">Admin-Controlled System</h2>
                <p className="text-blue-800 leading-relaxed">
                    All system behavior is managed from the admin panel. Frontend users cannot change any system settings.
                    This platform is production-ready and centrally controlled. Configuration changes must be made through
                    environment variables and administrative interfaces only.
                </p>
            </div>

            {/* Admin Capabilities */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">What Administrators Control</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold text-lg">•</span>
                        <span className="text-gray-700">User & role management</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold text-lg">•</span>
                        <span className="text-gray-700">Feature enable/disable</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold text-lg">•</span>
                        <span className="text-gray-700">Integration & API configuration</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <span className="text-indigo-600 font-bold text-lg">•</span>
                        <span className="text-gray-700">Monitoring & reporting</span>
                    </div>
                </div>
            </div>

            {/* Last Checked & Refresh */}
            <div className="flex items-center justify-between bg-gray-50 rounded-lg px-6 py-4">
                <p className="text-sm text-gray-600">
                    Last checked: <span className="font-medium text-gray-900">{new Date(status.lastChecked).toLocaleString()}</span>
                </p>
                <button
                    onClick={loadStatus}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Status
                </button>
            </div>
        </div>
    );
}
