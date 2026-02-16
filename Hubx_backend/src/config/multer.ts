import multer from "multer"

const storage = multer.memoryStorage()

const fileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Only image files are allowed"))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

// Separate multer instance for Excel files (bulk upload)
const excelFileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    "application/vnd.ms-excel", // .xls
  ]
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error("Only Excel files (.xlsx, .xls) are allowed"))
  }
}

export const uploadExcel = multer({
  storage,
  fileFilter: excelFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for Excel files
})

export default upload
