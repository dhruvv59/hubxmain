"use client";

import React, { useState, useEffect } from "react";
import { Bell, Lock, Shield, Globe, Moon, Smartphone, Mail, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

interface SettingsState {
    notifications: {
        email: boolean;
        push: boolean;
        assignments: boolean;
        assessments: boolean;
        announcements: boolean;
    };
    privacy: {
        profileVisibility: "public" | "private" | "friends";
        showPerformance: boolean;
    };
    preferences: {
        language: "en" | "gu" | "hi";
        theme: "light" | "dark";
    };
}

export default function SettingsPage() {
    const { user } = useAuth();
    const [settings, setSettings] = useState<SettingsState>({
        notifications: {
            email: true,
            push: false,
            assignments: true,
            assessments: true,
            announcements: false,
        },
        privacy: {
            profileVisibility: "public",
            showPerformance: true,
        },
        preferences: {
            language: "en",
            theme: "light",
        },
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Load settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                if (!user?.id) return;
                const { settingsService } = await import("@/services/settings");
                const data = await settingsService.getSettings(user.id);
                setSettings({
                    notifications: data.notifications,
                    privacy: data.privacy,
                    preferences: data.preferences,
                });
            } catch (error) {
                console.error("Failed to load settings:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, [user?.id]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (!user?.id) throw new Error("User ID not found");
            const { settingsService } = await import("@/services/settings");
            await settingsService.updateSettings(user.id, {
                notifications: settings.notifications,
                privacy: settings.privacy,
                preferences: settings.preferences,
            });
            alert("Settings saved successfully!");
        } catch (error: any) {
            console.error("Failed to save settings:", error);
            alert(error?.message || "Failed to save settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your account preferences</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                </button>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                            <Bell className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Notifications</h2>
                            <p className="text-sm text-gray-500">Configure how you receive updates</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <SettingToggle
                        label="Email Notifications"
                        description="Receive notifications via email"
                        checked={settings.notifications.email}
                        onChange={(checked) =>
                            setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, email: checked },
                            })
                        }
                        icon={Mail}
                    />
                    <SettingToggle
                        label="Push Notifications"
                        description="Receive push notifications on your device"
                        checked={settings.notifications.push}
                        onChange={(checked) =>
                            setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, push: checked },
                            })
                        }
                        icon={Smartphone}
                    />
                    <SettingToggle
                        label="Assignment Updates"
                        description="Get notified when new assignments are posted"
                        checked={settings.notifications.assignments}
                        onChange={(checked) =>
                            setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, assignments: checked },
                            })
                        }
                    />
                    <SettingToggle
                        label="Assessment Reminders"
                        description="Receive reminders about upcoming assessments"
                        checked={settings.notifications.assessments}
                        onChange={(checked) =>
                            setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, assessments: checked },
                            })
                        }
                    />
                </div>
            </div>

            {/* Privacy */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Privacy</h2>
                            <p className="text-sm text-gray-500">Control your data and visibility</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Profile Visibility
                        </label>
                        <select
                            value={settings.privacy.profileVisibility}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    privacy: { ...settings.privacy, profileVisibility: e.target.value as "public" | "private" | "friends" },
                                })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        >
                            <option value="public">Public - Everyone can see</option>
                            <option value="friends">Friends Only</option>
                            <option value="private">Private - Only me</option>
                        </select>
                    </div>
                    <SettingToggle
                        label="Show Performance Metrics"
                        description="Display your scores and rankings publicly"
                        checked={settings.privacy.showPerformance}
                        onChange={(checked) =>
                            setSettings({
                                ...settings,
                                privacy: { ...settings.privacy, showPerformance: checked },
                            })
                        }
                    />
                </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-50 flex items-center justify-center">
                            <Globe className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Preferences</h2>
                            <p className="text-sm text-gray-500">Customize your experience</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Language
                        </label>
                        <select
                            value={settings.preferences.language}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    preferences: { ...settings.preferences, language: e.target.value as "en" | "gu" | "hi" },
                                })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        >
                            <option value="en">English</option>
                            <option value="hi">हिन्दी</option>
                            <option value="gu">ગુજરાતી</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                            Theme
                        </label>
                        <select
                            value={settings.preferences.theme}
                            onChange={(e) =>
                                setSettings({
                                    ...settings,
                                    preferences: { ...settings.preferences, theme: e.target.value as "light" | "dark" },
                                })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <Lock className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Security</h2>
                            <p className="text-sm text-gray-500">Manage your account security</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <button className="w-full px-4 py-3 border-2 border-blue-200 text-blue-700 rounded-xl font-medium hover:bg-blue-50 transition-colors">
                        Change Password
                    </button>
                </div>
            </div>
        </div>
    );
}

function SettingToggle({
    label,
    description,
    checked,
    onChange,
    icon: Icon,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    icon?: any;
}) {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3 flex-1">
                {Icon && (
                    <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="h-4 w-4 text-gray-600" />
                    </div>
                )}
                <div>
                    <p className="font-medium text-gray-900">{label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                </div>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0",
                    checked ? "bg-blue-600" : "bg-gray-300"
                )}
            >
                <span
                    className={cn(
                        "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                        checked ? "translate-x-6" : "translate-x-1"
                    )}
                />
            </button>
        </div>
    );
}
