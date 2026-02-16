import { Router, Request, Response } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import { settingsService } from "../services/settings.service";
import {
  validateSettingsUpdate,
  handleValidationErrors,
} from "../validators/settings.validator";

const router = Router();

/**
 * GET /api/v1/student/settings/:studentId
 * Fetch student's settings
 */
router.get("/:studentId", authenticate, async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const userId = (req as any).user?.id;

    // Authorization
    if (studentId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own settings",
      });
    }

    const settings = await settingsService.getSettings(studentId);

    return res.status(200).json({
      success: true,
      message: "Settings fetched successfully",
      data: settings,
    });
  } catch (error: any) {
    console.error("Get settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch settings",
      requestId: (req as any).id,
    });
  }
});

/**
 * PUT /api/v1/student/settings/:studentId
 * Update student's settings
 */
router.put(
  "/:studentId",
  authenticate,
  validateSettingsUpdate,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { studentId } = req.params;
      const userId = (req as any).user?.id;

      // Authorization
      await settingsService.validateOwnership(studentId, userId);

      const { notifications, privacy, preferences } = req.body;

      const updatedSettings = await settingsService.updateSettings(studentId, {
        notifications,
        privacy,
        preferences,
      });

      return res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        data: updatedSettings,
      });
    } catch (error: any) {
      console.error("Update settings error:", error);

      if (error.status === 403) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update settings",
        requestId: (req as any).id,
      });
    }
  }
);

export default router;
