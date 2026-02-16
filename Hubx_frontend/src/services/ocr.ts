import { http } from "@/lib/http-client";
import { OCR_ENDPOINTS } from "@/lib/api-config";

/**
 * OCR Service
 *
 * Handles image-to-text extraction using backend OCR endpoint
 *
 * IMPORTANT: Uses FormData which requires special handling
 * (http-client stringifies bodies, so we bypass it for file uploads)
 */
export const ocrService = {
    /**
     * Extract text from an uploaded image
     *
     * @param file - Image file (JPG, PNG, etc.)
     * @returns Extracted text string
     *
     * @example
     * const file = input.files[0];
     * const { text } = await ocrService.extractText(file);
     */
    extractText: async (file: File): Promise<{ text: string }> => {
        try {
            const formData = new FormData();
            formData.append("image", file);

            // Manual fetch for FormData support
            // http-client JSON.stringify breaks FormData, so we use raw fetch
            const token = typeof window !== 'undefined'
                ? localStorage.getItem('hubx_access_token')
                : null;

            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            // DO NOT set Content-Type - browser sets it automatically with boundary

            const response = await fetch(OCR_ENDPOINTS.extractText(), {
                method: 'POST',
                body: formData,
                headers: headers
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'OCR extraction failed' }));
                throw new Error(error.message || `OCR failed with status ${response.status}`);
            }

            const data = await response.json();

            // Backend returns: { success: true, data: { text: "..." } }
            return data.data;

        } catch (error) {
            console.error("[OCR] Failed to extract text:", error);
            throw error;
        }
    }
};
