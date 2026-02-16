import { body, validationResult } from "express-validator"
import type { Request, Response, NextFunction } from "express"

export const validateEmail = body("email").isEmail().normalizeEmail()
export const validatePassword = body("password").isLength({ min: 6 })
export const validateName = body("name").trim().notEmpty()

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    })
  }
  next()
}
