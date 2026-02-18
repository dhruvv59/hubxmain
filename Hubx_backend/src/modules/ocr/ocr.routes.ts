import { Router } from "express"
import { ocrController } from "./ocr.controller"
import { authenticate } from "@middlewares/auth"
import upload from "@config/multer"
import multer from "multer"
import { asyncHandler } from "@utils/errors"

const router = Router()

// PDF upload configuration - separate from image uploads
const pdfStorage = multer.memoryStorage()
const pdfFileFilter = (req: any, file: any, cb: any) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true)
    } else {
        cb(new Error("Only PDF files are allowed"))
    }
}
const pdfUpload = multer({
    storage: pdfStorage,
    fileFilter: pdfFileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB for PDFs
})

// ODF upload configuration - for OpenDocument Format files
const odfStorage = multer.memoryStorage()
const odfFileFilter = (req: any, file: any, cb: any) => {
    const allowedMimes = [
        "application/vnd.oasis.opendocument.text", // .odt
        "application/vnd.oasis.opendocument.spreadsheet", // .ods
        "application/vnd.oasis.opendocument.presentation", // .odp
        "application/vnd.oasis.opendocument.graphics", // .odg
    ]
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error("Only ODF files (.odt, .ods, .odp, .odg) are allowed"))
    }
}
const odfUpload = multer({
    storage: odfStorage,
    fileFilter: odfFileFilter,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB for ODF files
})

// POST /api/ocr/extract-text - Extract text from uploaded image
router.post(
    "/extract-text",
    authenticate,
    upload.single("image"),
    asyncHandler(ocrController.extractText.bind(ocrController))
)

// POST /api/ocr/extract-text/pdf - Extract text from uploaded PDF
router.post(
    "/extract-text/pdf",
    authenticate,
    pdfUpload.single("pdf"),
    asyncHandler(ocrController.extractTextFromPDF.bind(ocrController))
)

// POST /api/ocr/extract-text/odf - Extract text from uploaded ODF file
router.post(
    "/extract-text/odf",
    authenticate,
    odfUpload.single("odf"),
    asyncHandler(ocrController.extractTextFromODF.bind(ocrController))
)

export default router
