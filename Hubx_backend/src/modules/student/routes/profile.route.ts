import { Router, Request, Response, NextFunction } from "express";
import { authenticate } from "@middlewares/auth";
import { profileService } from "../services/profile.service";
import {
  validateProfileUpdate,
  handleValidationErrors,
} from "../validators/profile.validator";

const router = Router();

/**
 * GET /api/v1/student/profile/:studentId
 * Fetch student's profile with extended details
 */
router.get("/:studentId", authenticate, async (req: Request, res: Response) => {
  try {
    const { studentId } = req.params;
    const userId = (req as any).user?.id;

    // Authorization: Can only get own profile
    if (studentId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own profile",
      });
    }

    const profile = await profileService.getProfile(studentId);

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (error: any) {
    console.error("Get profile error:", error);
    if (error.status === 404) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      requestId: (req as any).id,
    });
  }
});

/**
 * PUT /api/v1/student/profile/:studentId
 * Update student's profile
 */
router.put(
  "/:studentId",
  authenticate,
  validateProfileUpdate,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { studentId } = req.params;
      const userId = (req as any).user?.id;

      // Authorization: Can only update own profile
      await profileService.validateOwnership(studentId, userId);

      const { fullName, phone, address, dateOfBirth } = req.body;

      // Build update object
      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;
      if (phone) updateData.phone = phone;
      if (address) updateData.address = address;
      if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);

      const updatedProfile = await profileService.updateProfile(
        studentId,
        updateData
      );

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
      });
    } catch (error: any) {
      console.error("Update profile error:", error);

      if (error.status === 403) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (error.status === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update profile",
        requestId: (req as any).id,
      });
    }
  }
);

export default router;
