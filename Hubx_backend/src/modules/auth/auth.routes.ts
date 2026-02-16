import { Router } from "express"
import { authController } from "./auth.controller"
import { authMiddleware } from "@middlewares/auth"

const router = Router()

router.post("/register", authController.register)
router.post("/login", authController.login)
router.post("/refresh-token", authController.refreshToken)
router.get("/profile", authMiddleware, authController.getProfile)
router.post("/logout", authMiddleware, authController.logout)

export default router
