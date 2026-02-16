import { body, query, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

export const validateCreateTicket = [
  body("subject")
    .isString()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Subject must be between 5-200 characters"),

  body("message")
    .isString()
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage("Message must be between 10-5000 characters"),

  body("category")
    .isIn(["payment", "technical", "content", "account", "other"])
    .withMessage("Invalid category"),

  body("attachments")
    .optional()
    .isArray()
    .withMessage("Attachments must be an array"),
];

export const validateListTickets = [
  query("status")
    .optional()
    .isIn(["open", "in_progress", "resolved", "closed", "reopened"])
    .withMessage("Invalid status filter"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .toInt()
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .toInt()
    .withMessage("Limit must be between 1-100"),
];

export const validateReplyTicket = [
  param("ticketId")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Ticket ID is required"),

  body("message")
    .isString()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage("Message must be between 1-5000 characters"),
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
