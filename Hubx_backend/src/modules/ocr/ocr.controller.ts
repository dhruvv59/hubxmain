import { Request, Response } from "express"
import { ocrService } from "./ocr.service"
import { AppError } from "@utils/errors"

export class OcrController {
    async extractText(req: Request, res: Response) {
        try {
            // Check if file was uploaded
            if (!req.file) {
                throw new AppError(400, "No image file uploaded")
            }

            // Extract text from the uploaded image
            const result = await ocrService.extractTextFromImage(req.file.buffer)

            res.json({
                success: true,
                data: result,
            })
        } catch (error) {
            throw error
        }
    }

    async extractTextFromPDF(req: Request, res: Response) {
        try {
            // Check if file was uploaded
            if (!req.file) {
                throw new AppError(400, "No PDF file uploaded")
            }

            // Extract text from the uploaded PDF (processes all pages)
            const result = await ocrService.extractTextFromPDF(req.file.buffer)

            res.json({
                success: true,
                data: result,
            })
        } catch (error) {
            throw error
        }
    }

    async extractTextFromODF(req: Request, res: Response) {
        try {
            // Check if file was uploaded
            if (!req.file) {
                throw new AppError(400, "No ODF file uploaded")
            }

            // Extract text from the uploaded ODF file
            const result = await ocrService.extractTextFromODF(req.file.buffer)

            res.json({
                success: true,
                data: result,
            })
        } catch (error) {
            throw error
        }
    }
}

export const ocrController = new OcrController()
