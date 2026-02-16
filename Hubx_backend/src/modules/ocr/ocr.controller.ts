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
}

export const ocrController = new OcrController()
