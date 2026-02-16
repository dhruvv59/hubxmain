import { http } from "@/lib/http-client";
import { ORGANIZATION_ENDPOINTS } from "@/lib/api-config";

export interface Organization {
    id: string;
    name: string;
    description?: string;
    logoUrl?: string;
    createdAt: string;
    ownerId: string;
    _count?: {
        members: number;
    };
}

export interface OrganizationMember {
    id: string;
    userId: string;
    role: "OWNER" | "ADMIN" | "MEMBER";
    joinedAt: string;
    user: {
        name: string;
        email: string;
        avatar?: string;
    };
}

export const organizationService = {
    /**
     * Create a new organization
     */
    create: async (data: {
        name: string;
        type: string;
        code: string;
        description?: string;
        logoUrl?: string
    }) => {
        try {
            const response = await http.post<{ success: boolean; data: Organization }>(
                ORGANIZATION_ENDPOINTS.create(),
                data
            );
            return response.data;
        } catch (error) {
            console.error("[Organization] Failed to create org:", error);
            throw error;
        }
    },

    /**
     * Get all organizations
     */
    getAll: async () => {
        try {
            const response = await http.get<{ success: boolean; data: Organization[] }>(
                ORGANIZATION_ENDPOINTS.getAll()
            );
            return response.data;
        } catch (error) {
            console.error("[Organization] Failed to fetch orgs:", error);
            throw error;
        }
    },

    /**
     * Get organization by ID
     */
    getById: async (id: string) => {
        try {
            const response = await http.get<{ success: boolean; data: Organization }>(
                ORGANIZATION_ENDPOINTS.getById(id)
            );
            return response.data;
        } catch (error) {
            console.error("[Organization] Failed to fetch org:", error);
            throw error;
        }
    },

    /**
     * Get organization members
     */
    getMembers: async (id: string) => {
        try {
            const response = await http.get<{ success: boolean; data: OrganizationMember[] }>(
                ORGANIZATION_ENDPOINTS.getMembers(id)
            );
            return response.data;
        } catch (error) {
            console.error("[Organization] Failed to fetch members:", error);
            throw error;
        }
    },

    /**
     * Add member to organization
     */
    addMember: async (id: string, email: string, role: string = "MEMBER") => {
        try {
            const response = await http.post(ORGANIZATION_ENDPOINTS.addMember(id), {
                email,
                role
            });
            return response;
        } catch (error) {
            console.error("[Organization] Failed to add member:", error);
            throw error;
        }
    },

    /**
     * Remove member from organization
     */
    removeMember: async (id: string, userId: string) => {
        try {
            await http.delete(ORGANIZATION_ENDPOINTS.removeMember(id, userId));
        } catch (error) {
            console.error("[Organization] Failed to remove member:", error);
            throw error;
        }
    },

    /**
     * Get user's organizations
     *
     * CHANGED: Now properly throws errors instead of silently returning empty array
     * UI should handle loading/error states appropriately
     */
    getUserOrganizations: async (userId: string) => {
        try {
            const response = await http.get<{ success: boolean; data: Organization[] }>(
                ORGANIZATION_ENDPOINTS.getUserOrgs(userId)
            );
            return response.data;
        } catch (error) {
            console.error("[Organization] Failed to fetch user organizations:", error);
            // Re-throw error so UI can show proper error state
            // Don't mask API failures as "no organizations"
            throw error;
        }
    }
};
