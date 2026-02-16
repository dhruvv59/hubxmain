import { Request, Response, NextFunction } from "express"

export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        })
    }

    if (user.role !== "SUPER_ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Super Admin privileges required.",
        })
    }

    next()
}

export const requireTeacher = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        })
    }

    if (user.role !== "TEACHER") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Teacher privileges required.",
        })
    }

    next()
}

export const requireStudent = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Authentication required",
        })
    }

    if (user.role !== "STUDENT") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Student privileges required.",
        })
    }

    next()
}
