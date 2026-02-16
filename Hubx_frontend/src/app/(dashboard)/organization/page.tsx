"use client";

import React, { useState, useEffect } from "react";
import { Plus, Users, Building, MoreVertical, X, Loader2 } from "lucide-react";
import { organizationService, Organization, OrganizationMember } from "@/services/organization";
import { getCurrentUser } from "@/services/auth";
import { cn } from "@/lib/utils";

export default function OrganizationPage() {
    const [orgs, setOrgs] = useState<Organization[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);

    // Add Member Modal State
    const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [newMemberRole, setNewMemberRole] = useState("MEMBER");
    const [isAddingMember, setIsAddingMember] = useState(false);
    const [addMemberError, setAddMemberError] = useState<string | null>(null);

    useEffect(() => {
        loadOrganizations();
    }, []);

    const loadOrganizations = async () => {
        setIsLoading(true);
        try {
            const user = await getCurrentUser();
            const data = await organizationService.getUserOrganizations(user.id);
            setOrgs(data);
        } catch (error) {
            console.error("Failed to load organizations:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateOrg = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get("name") as string;
        const type = formData.get("type") as string;
        const code = formData.get("code") as string;
        const description = formData.get("description") as string;

        try {
            await organizationService.create({ name, type, code, description });
            setIsCreateModalOpen(false);
            loadOrganizations();
        } catch (error) {
            console.error("Failed to create organization:", error);
        }
    };

    const handleViewMembers = async (org: Organization) => {
        setSelectedOrg(org);
        setIsLoadingMembers(true);
        try {
            const data = await organizationService.getMembers(org.id);
            setMembers(data);
        } catch (error) {
            console.error("Failed to load members:", error);
        } finally {
            setIsLoadingMembers(false);
        }
    };

    const handleAddMember = async () => {
        if (!selectedOrg || !newMemberEmail.trim()) return;

        setIsAddingMember(true);
        setAddMemberError(null);

        try {
            await organizationService.addMember(selectedOrg.id, newMemberEmail.trim(), newMemberRole);

            // Refresh members list
            const updatedMembers = await organizationService.getMembers(selectedOrg.id);
            setMembers(updatedMembers);

            // Close modal and reset
            setIsAddMemberModalOpen(false);
            setNewMemberEmail("");
            setNewMemberRole("MEMBER");
            setAddMemberError(null);
        } catch (error: any) {
            console.error("Failed to add member:", error);
            setAddMemberError(error.message || "Failed to add member. Please try again.");
        } finally {
            setIsAddingMember(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
                    <p className="text-gray-500 mt-1">Manage your organizations and memberships</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f4fbe] transition-colors font-medium"
                >
                    <Plus className="h-4 w-4" />
                    Create Organization
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 text-[#6366f1] animate-spin" />
                </div>
            ) : orgs.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
                    <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">No organizations found</h3>
                    <p className="text-gray-500 mb-6">Create one to get started collaborating</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-[#6366f1] font-medium hover:underline"
                    >
                        Create your first organization
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orgs.map((org) => (
                        <div key={org.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 font-bold text-xl">
                                    {org.name.charAt(0)}
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="h-5 w-5" />
                                </button>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{org.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-4 h-10">
                                {org.description || "No description provided"}
                            </p>
                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center text-gray-500 text-sm">
                                    <Users className="h-4 w-4 mr-1.5" />
                                    <span>{org._count?.members || 1} members</span>
                                </div>
                                <button
                                    onClick={() => handleViewMembers(org)}
                                    className="text-sm font-medium text-[#6366f1] hover:text-[#4f4fbe]"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Create New Organization</h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateOrg}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                                    <input
                                        name="name"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6366f1] focus:border-transparent outline-none"
                                        placeholder="e.g. Acme Corp"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
                                    <select
                                        name="type"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6366f1] focus:border-transparent outline-none"
                                    >
                                        <option value="">Select type</option>
                                        <option value="SCHOOL">School</option>
                                        <option value="COLLEGE">College</option>
                                        <option value="UNIVERSITY">University</option>
                                        <option value="INSTITUTION">Institution</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Organization Code</label>
                                    <input
                                        name="code"
                                        required
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6366f1] focus:border-transparent outline-none"
                                        placeholder="e.g. SCH001"
                                        pattern="[A-Z0-9]+"
                                        title="Please use only uppercase letters and numbers"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Unique identifier for your organization (uppercase letters and numbers only)</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        rows={3}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6366f1] focus:border-transparent outline-none resize-none"
                                        placeholder="Brief description of your organization"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[#6366f1] text-white font-medium rounded-lg hover:bg-[#4f4fbe] transition-colors"
                                >
                                    Create Organization
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Members Modal */}
            {selectedOrg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedOrg.name}</h2>
                                <p className="text-sm text-gray-500">Managing members</p>
                            </div>
                            <button
                                onClick={() => setSelectedOrg(null)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-gray-900">Members ({members.length})</h3>
                                <button
                                    onClick={() => setIsAddMemberModalOpen(true)}
                                    className="text-sm font-medium text-[#6366f1] hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    + Add Member
                                </button>
                            </div>

                            {isLoadingMembers ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="h-6 w-6 text-[#6366f1] animate-spin" />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {members.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold">
                                                    {member.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{member.user.name}</p>
                                                    <p className="text-sm text-gray-500">{member.user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={cn(
                                                    "text-xs font-bold px-2 py-1 rounded-full",
                                                    member.role === 'OWNER' ? "bg-amber-100 text-amber-700" :
                                                        member.role === 'ADMIN' ? "bg-blue-100 text-blue-700" :
                                                            "bg-gray-100 text-gray-600"
                                                )}>
                                                    {member.role}
                                                </span>
                                                {member.role !== 'OWNER' && (
                                                    <button className="text-sm text-red-500 hover:text-red-700 font-medium">Remove</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Member Modal */}
            {isAddMemberModalOpen && selectedOrg && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Add Member to {selectedOrg.name}</h2>
                            <button
                                onClick={() => {
                                    setIsAddMemberModalOpen(false);
                                    setNewMemberEmail("");
                                    setNewMemberRole("MEMBER");
                                    setAddMemberError(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={newMemberEmail}
                                    onChange={(e) => setNewMemberEmail(e.target.value)}
                                    placeholder="member@example.com"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6366f1] focus:border-transparent outline-none"
                                    disabled={isAddingMember}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role
                                </label>
                                <select
                                    value={newMemberRole}
                                    onChange={(e) => setNewMemberRole(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6366f1] focus:border-transparent outline-none"
                                    disabled={isAddingMember}
                                >
                                    <option value="MEMBER">Member</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            {addMemberError && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-600">{addMemberError}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAddMemberModalOpen(false);
                                    setNewMemberEmail("");
                                    setNewMemberRole("MEMBER");
                                    setAddMemberError(null);
                                }}
                                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-lg transition-colors"
                                disabled={isAddingMember}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddMember}
                                disabled={isAddingMember || !newMemberEmail.trim()}
                                className="px-6 py-2 bg-[#6366f1] text-white font-medium rounded-lg hover:bg-[#4f4fbe] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isAddingMember ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Adding...
                                    </>
                                ) : (
                                    "Add Member"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
