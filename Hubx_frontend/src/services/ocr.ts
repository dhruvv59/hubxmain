import { http } from "@/lib/http-client";
import { OCR_ENDPOINTS } from "@/lib/api-config";

/**
 * OCR Service
 *
 * Handles image and PDF-to-text extraction using backend OCR endpoint
 *
 * IMPORTANT: Uses FormData which requires special handling
 * (http-client stringifies bodies, so we bypass it for file uploads)
 */
export const ocrService = {
    /**
     * Extract text from an uploaded image or PDF
     *
     * @param file - Image file (JPG, PNG, etc.) or PDF file
     * @returns Extracted text string
     *
     * @example
     * const file = input.files[0];
     * const { text } = await ocrService.extractText(file);
     */
    extractText: async (file: File): Promise<{ text: string }> => {
        // Check if file is PDF
        if (file.type === 'application/pdf') {
            return ocrService.extractTextFromPDF(file);
        }
        // Check if file is ODF
        if (file.type.startsWith('application/vnd.oasis.opendocument')) {
            return ocrService.extractTextFromODF(file);
        }
        // Otherwise treat as image
        return ocrService.extractTextFromImage(file);
    },

    /**
     * Extract text from an image file
     */
    extractTextFromImage: async (file: File): Promise<{ text: string }> => {
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
            console.error("[OCR] Failed to extract text from image:", error);
            throw error;
        }
    },

    /**
     * Extract text from a PDF file
     */
    extractTextFromPDF: async (file: File): Promise<{ text: string }> => {
        try {
            const formData = new FormData();
            formData.append("pdf", file);

            // Manual fetch for FormData support
            const token = typeof window !== 'undefined'
                ? localStorage.getItem('hubx_access_token')
                : null;

            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            // DO NOT set Content-Type - browser sets it automatically with boundary

            const response = await fetch(`${OCR_ENDPOINTS.extractText()}/pdf`, {
                method: 'POST',
                body: formData,
                headers: headers
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'PDF OCR extraction failed' }));
                throw new Error(error.message || `PDF OCR failed with status ${response.status}`);
            }

            const data = await response.json();

            // Backend returns: { success: true, data: { text: "..." } }
            return data.data;

        } catch (error) {
            console.error("[OCR] Failed to extract text from PDF:", error);
            throw error;
        }
    },

    /**
     * Extract text from an ODF file (OpenDocument Format)
     */
    extractTextFromODF: async (file: File): Promise<{ text: string }> => {
        try {
            const formData = new FormData();
            formData.append("odf", file);

            // Manual fetch for FormData support
            const token = typeof window !== 'undefined'
                ? localStorage.getItem('hubx_access_token')
                : null;

            const headers: Record<string, string> = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            // DO NOT set Content-Type - browser sets it automatically with boundary

            const response = await fetch(`${OCR_ENDPOINTS.extractText()}/odf`, {
                method: 'POST',
                body: formData,
                headers: headers
            });

            if (!response.ok) {
                const error = await response.json().catch(() => ({ message: 'ODF OCR extraction failed' }));
                throw new Error(error.message || `ODF OCR failed with status ${response.status}`);
            }

            const data = await response.json();

            // Backend returns: { success: true, data: { text: "..." } }
            return data.data;

        } catch (error) {
            console.error("[OCR] Failed to extract text from ODF:", error);
            throw error;
        }
    }
};
