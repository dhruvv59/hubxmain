"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/ToastContainer";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: "",
    });

    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || "",
                email: user.email || "",
                phone: (user as any).phone || "",
                address: (user as any).address || "",
                dateOfBirth: (user as any).dateOfBirth || "",
            });
        }
    }, [user]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updateData = {
                fullName: formData.fullName,
                phone: formData.phone || undefined,
                address: formData.address || undefined,
                dateOfBirth: formData.dateOfBirth || undefined,
            };

            // Call API to update profile
            const { profileService } = await import("@/services/profile");
            if (!user?.id) throw new Error("User ID not found");

            await profileService.updateProfile(user.id, updateData);

            // Update local state
            setFormData({
                fullName: updateData.fullName,
                email: formData.email,
                phone: updateData.phone || "",
                address: updateData.address || "",
                dateOfBirth: updateData.dateOfBirth || "",
            });

            setIsEditing(false);
            // Show success toast
            addToast("Profile updated successfully!", "success");
        } catch (error: any) {
            console.error("Failed to save profile:", error);
            addToast(error?.message || "Failed to save profile. Please try again.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
                </div>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                        <Edit2 className="h-4 w-4" />
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                        >
                            <X className="h-4 w-4" />
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Save Changes
                        </button>
                    </div>
                )}
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Avatar Section */}
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 h-32 relative">
                    <div className="absolute -bottom-12 left-6">
                        <div className="h-24 w-24 rounded-full bg-white p-1 shadow-lg">
                            <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-white font-bold text-3xl">
                                    {user.fullName.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="pt-16 pb-6 px-6 space-y-6">
                    {/* Full Name */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <User className="h-4 w-4" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            disabled={!isEditing}
                            className={cn(
                                "w-full px-4 py-3 rounded-xl border transition-all",
                                isEditing
                                    ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            )}
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Mail className="h-4 w-4" />
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Phone className="h-4 w-4" />
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Enter your phone number"
                            className={cn(
                                "w-full px-4 py-3 rounded-xl border transition-all",
                                isEditing
                                    ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            )}
                        />
                    </div>

                    {/* Address */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <MapPin className="h-4 w-4" />
                            Address
                        </label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            disabled={!isEditing}
                            placeholder="Enter your address"
                            rows={3}
                            className={cn(
                                "w-full px-4 py-3 rounded-xl border transition-all resize-none",
                                isEditing
                                    ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            )}
                        />
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="h-4 w-4" />
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                            disabled={!isEditing}
                            className={cn(
                                "w-full px-4 py-3 rounded-xl border transition-all",
                                isEditing
                                    ? "border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            )}
                        />
                    </div>
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                <h3 className="text-sm font-bold text-blue-900 mb-3">Account Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-blue-600 font-medium">Role</p>
                        <p className="text-blue-900 font-bold capitalize">{user.role}</p>
                    </div>
                    <div>
                        <p className="text-blue-600 font-medium">User ID</p>
                        <p className="text-blue-900 font-mono text-xs">{user.id.slice(0, 12)}...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
