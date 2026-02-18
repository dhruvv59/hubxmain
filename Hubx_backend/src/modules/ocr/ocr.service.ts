import Tesseract from "tesseract.js"
import { AppError } from "@utils/errors"
import JSZip from "jszip"
import { parseStringPromise } from "xml2js"

// Dynamic import for pdfjs-dist (ES module compatible)
let pdfjs: any = null

async function getPdfjs() {
    if (!pdfjs) {
        pdfjs = await import("pdfjs-dist/legacy/build/pdf.js")
    }
    return pdfjs
}

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

    /**
     * Extract text from a PDF file
     * Extracts text from each PDF page
     * @param pdfBuffer - Buffer containing the PDF data
     * @returns Extracted text from all pages concatenated
     */
    async extractTextFromPDF(pdfBuffer: Buffer) {
        try {
            const pdfjsModule = await getPdfjs()
            // Convert Buffer to Uint8Array for pdfjs
            const uint8Array = new Uint8Array(pdfBuffer)
            const pdf = await pdfjsModule.getDocument({ data: uint8Array }).promise

            let allText = ""
            const totalPages = Math.min(pdf.numPages, 15) // Limit to 15 pages for performance
            let processedPages = 0

            console.log(`[PDF OCR] Starting extraction from ${totalPages} pages`)

            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                try {
                    const page = await pdf.getPage(pageNum)
                    const textContent = await page.getTextContent()
                    const pageText = textContent.items
                        .map((item: any) => item.str)
                        .join(" ")

                    if (pageText && pageText.trim().length > 0) {
                        allText += `\n--- Page ${pageNum} ---\n` + pageText.trim()
                        processedPages++
                    }

                    console.log(`[PDF OCR] Page ${pageNum}: Extracted ${pageText.length} characters`)
                } catch (pageError: any) {
                    console.warn(`[PDF OCR] Failed to process page ${pageNum}:`, pageError.message)
                    // Continue with next page if one fails
                    continue
                }
            }

            if (!allText || allText.trim().length === 0) {
                return {
                    text: "",
                    fullTextAnnotation: "",
                    confidence: 0,
                    pagesProcessed: processedPages,
                    message: "No text found in the PDF",
                }
            }

            console.log(`[PDF OCR] Completed: ${processedPages} pages processed`)

            return {
                text: allText.trim(),
                fullTextAnnotation: allText.trim(),
                confidence: 85, // PDFs with embedded text have high confidence
                pagesProcessed: processedPages,
                totalPages: totalPages,
            }
        } catch (error: any) {
            console.error("[PDF OCR] PDF Extraction Error:", error)

            if (error.message?.includes("Invalid PDF")) {
                throw new AppError(400, "Invalid PDF file. Please upload a valid PDF document.")
            }

            throw new AppError(500, `Failed to extract text from PDF: ${error.message}`)
        }
    }

    /**
     * Extract text from an ODF file (OpenDocument Format)
     * Supports .odt, .ods, .odp, etc.
     * @param odfBuffer - Buffer containing the ODF file data
     * @returns Extracted text from the document
     */
    async extractTextFromODF(odfBuffer: Buffer) {
        try {
            console.log("[ODF OCR] Starting ODF text extraction")

            // ODF files are ZIP archives, extract them
            const zip = new JSZip()
            await zip.loadAsync(odfBuffer)

            // Get content.xml from the archive
            const contentFile = zip.file("content.xml")
            if (!contentFile) {
                throw new Error("content.xml not found in ODF file")
            }

            const xmlContent = await contentFile.async("text")

            // Parse XML to extract text
            const parsed = await parseStringPromise(xmlContent, {
                explicitArray: false,
                mergeAttrs: true,
            })

            // Extract text from various ODF element types
            let allText = ""

            const extractText = (obj: any): void => {
                if (typeof obj === "string") {
                    if (obj.trim().length > 0) {
                        allText += obj + " "
                    }
                } else if (obj !== null && typeof obj === "object") {
                    for (const key in obj) {
                        if (key !== "$") {
                            extractText(obj[key])
                        }
                    }
                }
            }

            // Extract from document body
            if (parsed["office:document-content"]?.["office:body"]) {
                extractText(parsed["office:document-content"]["office:body"])
            }

            if (!allText || allText.trim().length === 0) {
                return {
                    text: "",
                    fullTextAnnotation: "",
                    confidence: 0,
                    message: "No text found in ODF file",
                }
            }

            // Clean up extra spaces
            const cleanText = allText.replace(/\s+/g, " ").trim()

            console.log(`[ODF OCR] Extracted ${cleanText.length} characters`)

            return {
                text: cleanText,
                fullTextAnnotation: cleanText,
                confidence: 90, // ODF with embedded text has high confidence
            }
        } catch (error: any) {
            console.error("[ODF OCR] ODF Extraction Error:", error)

            if (error.message?.includes("content.xml")) {
                throw new AppError(400, "Invalid ODF file. Missing content.xml")
            }

            if (error.message?.includes("ZIP")) {
                throw new AppError(400, "Invalid ODF file. Could not extract archive.")
            }

            throw new AppError(500, `Failed to extract text from ODF: ${error.message}`)
        }
    }
}

export const ocrService = new OcrService()
