import { http } from "@/lib/http-client";
import { PAYMENT_ENDPOINTS } from "@/lib/api-config";

export interface CreateOrderResponse {
    success: boolean;
    data: {
        orderId: string;
        amount: number;
        currency: string;
        key: string; // Razorpay key
    };
}

export interface VerifyPaymentResponse {
    success: boolean;
    message: string;
    data: {
        paymentId: string;
        transactionId: string;
    };
}

export interface PaymentHistoryItem {
    id: string;
    amount: number;
    status: string;
    date: string;
    paperId: string;
    paperTitle: string;
}

export interface PaymentHistoryResponse {
    success: boolean;
    data: PaymentHistoryItem[];
}

export const paymentService = {
    /**
     * Create a payment order
     */
    createOrder: async (amount: number, currency: string = "INR", paperId: string) => {
        try {
            const response = await http.post<CreateOrderResponse>(PAYMENT_ENDPOINTS.createOrder(), {
                amount,
                currency,
                paperId
            });
            return response.data;
        } catch (error) {
            console.error("[Payment] Failed to create order:", error);
            throw error;
        }
    },

    /**
     * Verify payment signature
     */
    /**
     * Verify payment signature
     */
    verifyPayment: async (orderId: string, paymentId: string, signature: string, paperId: string) => {
        try {
            const response = await http.post<VerifyPaymentResponse>(PAYMENT_ENDPOINTS.verify(), {
                orderId,
                paymentId,
                signature,
                paperId
            });
            return response.data;
        } catch (error) {
            console.error("[Payment] Failed to verify payment:", error);
            throw error;
        }
    },

    /**
     * Get payment history for the current user
     */
    getHistory: async () => {
        try {
            const response = await http.get<PaymentHistoryResponse>(PAYMENT_ENDPOINTS.history());
            return response.data;
        } catch (error) {
            console.error("[Payment] Failed to fetch history:", error);
            throw error;
        }
    },

    /**
     * Verify if user has access to a paper (used for free coupon verification)
     */
    verifyAccess: async (paperId: string): Promise<{ hasAccess: boolean }> => {
        try {
            const response = await http.get<{ success: boolean; data: { hasAccess: boolean } }>(
                PAYMENT_ENDPOINTS.verifyAccess(paperId)
            );
            return response.data;
        } catch (error) {
            console.error("[Payment] Failed to verify access:", error);
            throw error;
        }
    },

    /**
     * NEW: Claim free access to paper (100% coupon scenario)
     * @param paperId - Paper ID to claim
     * @returns Purchase confirmation
     */
    claimFreeAccess: async (paperId: string) => {
        try {
            const response = await http.post<{ success: boolean; message: string; data: any }>(
                PAYMENT_ENDPOINTS.claimFree(),
                { paperId }
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to claim free access");
            }

            return response.data;
        } catch (error: any) {
            console.error("[Payment] Failed to claim free access:", error);
            throw new Error(error.message || "Failed to claim free access");
        }
    }
};
