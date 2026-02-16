/**
 * System Status Service
 * Handles system health monitoring API calls
 */

import { http } from "@/lib/http-client";
import { SYSTEM_STATUS_ENDPOINTS } from "@/lib/api-config";
import type { SystemStatusResponse } from "@/types/system-status";

export const systemStatusService = {
    /**
     * Get system status
     * PUBLIC endpoint - no authentication required
     */
    getStatus: async (): Promise<SystemStatusResponse> => {
        try {
            const response = await http.get<SystemStatusResponse>(
                SYSTEM_STATUS_ENDPOINTS.getStatus(),
                { skipAuth: true }  // Public endpoint - no auth needed
            );
            return response;
        } catch (error) {
            console.error("[System Status] Failed to fetch status:", error);
            throw error;
        }
    }
};
