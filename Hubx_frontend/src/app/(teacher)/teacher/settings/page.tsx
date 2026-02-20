"use client";

import React, { useState, useEffect } from "react";
import { Bell, Lock, Shield, Globe, Moon, Smartphone, Mail, Save, Key, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface SettingsState {
    notifications: {
        email: boolean;
        push: boolean;
        studentActivity: boolean;
        paperPublished: boolean;
        studentQuestions: boolean;
    };
    privacy: {
        profileVisibility: "public" | "private";
        showStats: boolean;
    };
    preferences: {
        language: "en" | "gu" | "hi";
        theme: "light" | "dark" | "auto";
    };
}

export default function TeacherSettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [settings, setSettings] = useState<SettingsState>({
        notifications: {
            email: true,
            push: false,
            studentActivity: true,
            paperPublished: true,
            studentQuestions: true,
        },
        privacy: {
            profileVisibility: "public",
            showStats: true,
        },
        preferences: {
            language: "en",
            theme: "light",
        },
    });

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    // Load settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                if (!user?.id) return;
                const { settingsService } = await import("@/services/settings");
                const data = await settingsService.getSettings(user.id);
                setSettings({
                    notifications: data.notifications as any,
                    privacy: data.privacy as any,
                    preferences: data.preferences as any,
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

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            alert("Please fill all password fields");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }
        if (newPassword.length < 6) {
            alert("New password must be at least 6 characters long");
            return;
        }
        setIsSaving(true);
        try {
            const { changePassword } = await import("@/services/auth");
            await changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });
            alert("Password changed successfully!");
            setShowPasswordModal(false);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error("Failed to change password:", error);
            alert(error?.message || "Failed to change password. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        if (confirm("Are you sure you want to logout?")) {
            await logout();
            router.push("/login");
        }
    };

    if (isLoading) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your account preferences and security</p>
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
                        description="Receive important notifications via email"
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
                        label="Student Activity"
                        description="Get notified about student activity on your papers"
                        checked={settings.notifications.studentActivity}
                        onChange={(checked) =>
                            setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, studentActivity: checked },
                            })
                        }
                    />
                    <SettingToggle
                        label="Paper Published"
                        description="Receive confirmation when your papers are published"
                        checked={settings.notifications.paperPublished}
                        onChange={(checked) =>
                            setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, paperPublished: checked },
                            })
                        }
                    />
                    <SettingToggle
                        label="Student Questions"
                        description="Get notified when students ask questions about your papers"
                        checked={settings.notifications.studentQuestions}
                        onChange={(checked) =>
                            setSettings({
                                ...settings,
                                notifications: { ...settings.notifications, studentQuestions: checked },
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
                                    privacy: { ...settings.privacy, profileVisibility: e.target.value as "public" | "private" },
                                })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        >
                            <option value="public">Public - Students can see your profile</option>
                            <option value="private">Private - Only you</option>
                        </select>
                    </div>
                    <SettingToggle
                        label="Show Teaching Statistics"
                        description="Display your student count, papers published, and ratings publicly"
                        checked={settings.privacy.showStats}
                        onChange={(checked) =>
                            setSettings({
                                ...settings,
                                privacy: { ...settings.privacy, showStats: checked },
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
                                    preferences: { ...settings.preferences, theme: e.target.value as "light" | "dark" | "auto" },
                                })
                            }
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                        >
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                            <option value="auto">Auto (System)</option>
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
                <div className="p-6 space-y-3">
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full px-4 py-3 border-2 border-blue-200 text-blue-700 rounded-xl font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <Key className="h-4 w-4" />
                        Change Password
                    </button>
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 border-2 border-red-200 text-red-700 rounded-xl font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4">
                        <h3 className="text-lg font-bold text-gray-900">Change Password</h3>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Current Password
                            </label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Enter current password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleChangePassword}
                                disabled={isSaving}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
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
