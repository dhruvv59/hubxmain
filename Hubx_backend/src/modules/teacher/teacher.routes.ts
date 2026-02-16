import { Router } from "express"
import { teacherController } from "./teacher.controller"
import { questionBankController } from "./question-bank.controller"
import { authMiddleware, roleMiddleware } from "@middlewares/auth"
import upload, { uploadExcel } from "@config/multer"
import { ROLES } from "@utils/constants"

const router = Router()

// Middleware
router.use(authMiddleware)
router.use(roleMiddleware(ROLES.TEACHER))

// Standard routes
router.post("/standards", teacherController.createStandard)
router.get("/standards", teacherController.getStandards)
router.get("/standards/:standardId", teacherController.getStandard)
router.put("/standards/:standardId", teacherController.updateStandard)
router.delete("/standards/:standardId", teacherController.deleteStandard)

// Notification routes
router.get("/notifications", teacherController.getNotifications)

// Subject routes (nested under standard)
router.post("/standards/:standardId/subjects", teacherController.createSubject)
router.get("/standards/:standardId/subjects", teacherController.getSubjects)
router.get("/standards/:standardId/subjects/:subjectId", teacherController.getSubject)
router.put("/standards/:standardId/subjects/:subjectId", teacherController.updateSubject)
router.delete("/standards/:standardId/subjects/:subjectId", teacherController.deleteSubject)

// Chapter routes (nested under subject)
router.post("/standards/:standardId/subjects/:subjectId/chapters", teacherController.createChapter)
router.get("/standards/:standardId/subjects/:subjectId/chapters", teacherController.getChapters)
router.put("/standards/:standardId/subjects/:subjectId/chapters/:chapterId", teacherController.updateChapter)
router.delete("/standards/:standardId/subjects/:subjectId/chapters/:chapterId", teacherController.deleteChapter)

// Paper routes
router.post("/papers", teacherController.createPaper)
router.get("/papers", teacherController.getPapers)
router.get("/public-papers", teacherController.getPublicPapers)
router.get("/papers/:paperId", teacherController.getPaperById)
router.put("/papers/:paperId", teacherController.updatePaper)
router.patch("/papers/:paperId/publish", teacherController.publishPaper)
router.delete("/papers/:paperId", teacherController.deletePaper)
router.get("/papers/:paperId/analytics", teacherController.getPaperAnalytics)

// Question routes
router.post(
  "/papers/:paperId/questions",
  upload.fields([{ name: "questionImage" }, { name: "solutionImage" }]),
  teacherController.createQuestion,
)
router.get("/papers/:paperId/questions", teacherController.getQuestions)
router.put(
  "/papers/:paperId/questions/:questionId",
  upload.fields([{ name: "questionImage" }, { name: "solutionImage" }]),
  teacherController.updateQuestion,
)
router.delete("/papers/:paperId/questions/:questionId", teacherController.deleteQuestion)

// Bulk upload route
router.post(
  "/papers/:paperId/questions/bulk-upload",
  uploadExcel.single("file"),
  teacherController.bulkUploadQuestions,
)

// Question Bank routes
router.post(
  "/question-bank",
  upload.fields([{ name: "questionImage" }, { name: "solutionImage" }]),
  questionBankController.createBankQuestion,
)
router.get("/question-bank", questionBankController.getBankQuestions)
router.get("/question-bank/:questionId", questionBankController.getBankQuestion)
router.put(
  "/question-bank/:questionId",
  upload.fields([{ name: "questionImage" }, { name: "solutionImage" }]),
  questionBankController.updateBankQuestion,
)
router.delete("/question-bank/:questionId", questionBankController.deleteBankQuestion)
router.post("/question-bank/:questionId/add-to-paper", questionBankController.addToPaper)
router.post(
  "/question-bank/bulk-upload",
  uploadExcel.single("file"),
  questionBankController.bulkUploadBankQuestions,
)

export default router
