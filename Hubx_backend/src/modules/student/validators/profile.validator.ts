import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

/**
 * Validation middleware for profile update
 * Checks all required fields and formats
 */
export const validateProfileUpdate = [
  param("studentId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Student ID is required"),

  body("fullName")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Full name must be between 3-100 characters"),

  body("phone")
    .optional()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage("Invalid phone number format"),

  body("address")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Address must not exceed 500 characters"),

  body("dateOfBirth")
    .optional()
    .isISO8601()
    .withMessage("Invalid date format (must be ISO 8601)")
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      if (date > today) {
        throw new Error("Date of birth cannot be in the future");
      }
      return true;
    }),
];

/**
 * Validation error handler
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Transform errors to user-friendly format
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
