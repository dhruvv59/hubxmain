import { http } from "@/lib/http-client";
import { COUPON_ENDPOINTS } from "@/lib/api-config";

export interface Coupon {
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FLAT";
    discountValue: number;
    maxDiscount?: number;
    minOrderValue?: number;
    expiryDate: string;
    isActive: boolean;
}

export const couponService = {
    /**
     * Validate a coupon code
     */
    validate: async (code: string, paperId: string) => {
        try {
            const response = await http.post<{ success: boolean; message: string; data: any }>(
                COUPON_ENDPOINTS.validate(),
                {
                    code,
                    paperId
                }
            );
            return response.data;
        } catch (error) {
            console.error("[Coupon] Failed to validate coupon:", error);
            throw error;
        }
    },

    /**
     * Get my coupon for a paper
     */
    getMyCoupon: async (paperId: string) => {
        try {
            const response = await http.get<{ success: boolean; data: Coupon }>(
                COUPON_ENDPOINTS.getMyCoupon(paperId)
            );
            return response.data;
        } catch (error) {
            // It's okay if no coupon exists
            return null;
        }
    },

    /**
     * Get all available coupons for a paper
     */
    getPaperCoupons: async (paperId: string) => {
        try {
            const response = await http.get<{ success: boolean; data: Coupon[] }>(
                COUPON_ENDPOINTS.getPaperCoupons(paperId)
            );
            return response.data;
        } catch (error) {
            console.error("[Coupon] Failed to fetch paper coupons:", error);
            return [];
        }
    },

    /**
     * Regenerate coupon for a paper
     */
    regenerate: async (paperId: string) => {
        try {
            const response = await http.post<{ success: boolean; data: Coupon }>(
                COUPON_ENDPOINTS.regenerate(paperId)
            );
            return response.data;
        } catch (error) {
            console.error("[Coupon] Failed to regenerate coupon:", error);
            throw error;
        }
    }
};
