import { Router, Request, Response } from "express";
import { authenticate } from "@/middlewares/auth.middleware";
import { achievementsService } from "../services/achievements.service";

const router = Router();

/**
 * GET /api/v1/student/achievements/:studentId
 * Fetch student's achievements with progress
 */
router.get(
  "/:studentId",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { studentId } = req.params;
      const userId = (req as any).user?.id;

      // Authorization: Can only view own achievements
      if (studentId !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only view your own achievements",
        });
      }

      const achievements = await achievementsService.getAchievements(studentId);

      return res.status(200).json({
        success: true,
        message: "Achievements fetched successfully",
        data: achievements,
      });
    } catch (error: any) {
      console.error("Get achievements error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch achievements",
        requestId: (req as any).id,
      });
    }
  }
);

/**
 * POST /api/v1/student/achievements/seed (ADMIN ONLY)
 * Seed default achievements into database
 * Call this once during initialization
 */
router.post(
  "/seed",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      // Only super admins can seed
      if (user?.role !== "SUPER_ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Only admins can seed achievements",
        });
      }

      await achievementsService.seedDefaultAchievements();

      return res.status(201).json({
        success: true,
        message: "Achievements seeded successfully",
      });
    } catch (error: any) {
      console.error("Seed achievements error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to seed achievements",
        requestId: (req as any).id,
      });
    }
  }
);

export default router;
