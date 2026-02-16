import { Router } from "express"
import { notificationController } from "./notification.controller"
import { authMiddleware, roleMiddleware } from "@middlewares/auth"
import { ROLES } from "@utils/constants"

const router = Router()

// Apply authentication to all routes
router.use(authMiddleware)

// User notification endpoints
router.get("/", notificationController.getNotifications)
router.get("/stats", notificationController.getNotificationStats)
router.get("/:id", notificationController.getNotificationById)
router.patch("/:id/read", notificationController.markAsRead)
router.patch("/mark-all-read", notificationController.markAllAsRead)
router.delete("/:id", notificationController.deleteNotification)

// Admin/System only - Create notification
router.post(
  "/",
  roleMiddleware(ROLES.SUPER_ADMIN, ROLES.TEACHER),
  notificationController.createNotification
)

export default router
