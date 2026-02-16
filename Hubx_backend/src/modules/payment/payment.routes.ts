import { Router } from "express"
import { paymentController } from "./payment.controller"
import { authMiddleware, roleMiddleware } from "@middlewares/auth"
import { ROLES } from "@utils/constants"

const router = Router()

// WEBHOOK ROUTE - No authentication (Razorpay doesn't send auth headers)
// Must be BEFORE middleware to avoid auth checks
router.post("/webhook", paymentController.handleWebhook)

// Authenticated routes
router.use(authMiddleware)
router.use(roleMiddleware(ROLES.STUDENT))

router.post("/create-order", paymentController.createOrder)
router.post("/verify", paymentController.verifyPayment)
router.get("/history", paymentController.getPaymentHistory)
router.get("/verify-access/:paperId", paymentController.verifyAccess)
router.post("/claim-free", paymentController.claimFreeAccess) // NEW

export default router

