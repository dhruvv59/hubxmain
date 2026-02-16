import { Router } from "express"
import { authenticate } from "@middlewares/auth"
import { couponController } from "./coupon.controller"

const router = Router()

// Student endpoints
router.post("/validate", authenticate, couponController.validateCoupon)
router.get("/my-coupon/:paperId", authenticate, couponController.getMyCoupon)

// Teacher endpoints
router.get("/paper/:paperId", authenticate, couponController.getPaperCoupons)
router.post("/regenerate/:paperId", authenticate, couponController.regenerateCoupons)

export default router
