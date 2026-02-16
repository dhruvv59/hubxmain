import { Router } from "express"
import { ocrController } from "./ocr.controller"
import { authenticate } from "@middlewares/auth"
import upload from "@config/multer"
import { asyncHandler } from "@utils/errors"

const router = Router()

// POST /api/ocr/extract-text - Extract text from uploaded image
router.post(
    "/extract-text",
    authenticate,
    upload.single("image"),
    asyncHandler(ocrController.extractText.bind(ocrController))
)

export default router
