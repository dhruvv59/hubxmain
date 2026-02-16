import Tesseract from "tesseract.js"
import { AppError } from "@utils/errors"

export class OcrService {
    /**
     * Extract text from image using Tesseract OCR
     * @param imageBuffer - Buffer containing the image data
     * @returns Extracted text and metadata
     */
    async extractTextFromImage(imageBuffer: Buffer) {
        try {
            // Convert buffer to base64 for Tesseract
            const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`

            // Perform OCR using Tesseract
            const result = await Tesseract.recognize(base64Image, "eng", {
                logger: (m) => {
                    // Optional: Log progress for debugging
                    if (m.status === "recognizing text") {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
                    }
                },
            })

            const { text, confidence } = result.data

            // Check if any text was detected
            if (!text || text.trim().length === 0) {
                return {
                    text: "",
                    fullTextAnnotation: "",
                    confidence: 0,
                    textBlocks: [],
                    message: "No text found in the image",
                }
            }

            // Extract words and lines from the first page (if available)
            const words = (result.data as any).words || []
            const lines = (result.data as any).lines || []

            // Map Tesseract words to text blocks format (similar to Google Vision)
            const textBlocks = words
                .filter((word: any) => word.text && word.text.trim().length > 0)
                .map((word: any) => ({
                    description: word.text,
                    boundingBox: {
                        x0: word.bbox?.x0 || 0,
                        y0: word.bbox?.y0 || 0,
                        x1: word.bbox?.x1 || 0,
                        y1: word.bbox?.y1 || 0,
                    },
                    confidence: word.confidence || 0,
                }))

            // Map lines with proper structure
            const lineData = lines
                .filter((line: any) => line.text && line.text.trim().length > 0)
                .map((line: any) => ({
                    text: line.text,
                    confidence: line.confidence || 0,
                    boundingBox: {
                        x0: line.bbox?.x0 || 0,
                        y0: line.bbox?.y0 || 0,
                        x1: line.bbox?.x1 || 0,
                        y1: line.bbox?.y1 || 0,
                    },
                }))

            return {
                text: text.trim(),
                fullTextAnnotation: text.trim(),
                confidence: Math.round(confidence * 100) / 100, // Round to 2 decimal places
                textBlocks,
                lines: lineData,
            }
        } catch (error: any) {
            console.error("Tesseract OCR Error:", error)

            // Handle specific Tesseract errors
            if (error.message?.includes("Invalid image")) {
                throw new AppError(400, "Invalid image format. Please upload a valid image file (PNG, JPG, JPEG).")
            }

            if (error.message?.includes("Worker")) {
                throw new AppError(500, "OCR service temporarily unavailable. Please try again later.")
            }

            throw new AppError(500, `Failed to extract text from image: ${error.message}`)
        }
    }

    /**
     * Extract text from image with custom language support
     * @param imageBuffer - Buffer containing the image data
     * @param language - Language code (e.g., 'eng', 'spa', 'fra', 'deu', 'chi_sim')
     * @returns Extracted text and metadata
     */
    async extractTextWithLanguage(imageBuffer: Buffer, language: string = "eng") {
        try {
            const base64Image = `data:image/png;base64,${imageBuffer.toString("base64")}`

            const result = await Tesseract.recognize(base64Image, language, {
                logger: (m) => {
                    if (m.status === "recognizing text") {
                        console.log(`OCR Progress (${language}): ${Math.round(m.progress * 100)}%`)
                    }
                },
            })

            const { text, confidence } = result.data
            const words = (result.data as any).words || []

            if (!text || text.trim().length === 0) {
                return {
                    text: "",
                    fullTextAnnotation: "",
                    confidence: 0,
                    message: "No text found in the image",
                }
            }

            return {
                text: text.trim(),
                fullTextAnnotation: text.trim(),
                confidence: Math.round(confidence * 100) / 100,
                language,
                wordCount: words.length,
            }
        } catch (error: any) {
            console.error(`Tesseract OCR Error (${language}):`, error)
            throw new AppError(500, `Failed to extract text from image: ${error.message}`)
        }
    }
}

export const ocrService = new OcrService()
