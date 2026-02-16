import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateSettingsUpdate = [
  param("studentId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Student ID is required"),

  // Notifications
  body("notifications.email")
    .optional()
    .isBoolean()
    .withMessage("Email notification must be a boolean"),

  body("notifications.push")
    .optional()
    .isBoolean()
    .withMessage("Push notification must be a boolean"),

  body("notifications.assignments")
    .optional()
    .isBoolean()
    .withMessage("Assignment notification must be a boolean"),

  body("notifications.assessments")
    .optional()
    .isBoolean()
    .withMessage("Assessment notification must be a boolean"),

  body("notifications.announcements")
    .optional()
    .isBoolean()
    .withMessage("Announcement notification must be a boolean"),

  // Privacy
  body("privacy.profileVisibility")
    .optional()
    .isIn(["public", "private", "friends"])
    .withMessage("Profile visibility must be 'public', 'private', or 'friends'"),

  body("privacy.showPerformance")
    .optional()
    .isBoolean()
    .withMessage("Show performance must be a boolean"),

  // Preferences
  body("preferences.language")
    .optional()
    .isIn(["en", "gu", "hi"])
    .withMessage("Language must be 'en', 'gu', or 'hi'"),

  body("preferences.theme")
    .optional()
    .isIn(["light", "dark"])
    .withMessage("Theme must be 'light' or 'dark'"),
];

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors: Record<string, string> = {};
    errors.array().forEach((error) => {
      if (error.type === "field") {
        formattedErrors[error.path] = error.msg;
      }
    });

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }
  next();
};
