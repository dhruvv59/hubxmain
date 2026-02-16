import { Request, Response } from "express"
import { couponService } from "./coupon.service"

export class CouponController {
    async validateCoupon(req: Request, res: Response) {
        try {
            const { code, paperId } = req.body
            const studentId = (req as any).user.userId

            if (!code || !paperId) {
                return res.status(400).json({
                    success: false,
                    message: "Coupon code and paper ID are required",
                })
            }

            const result = await couponService.validateAndUseCoupon(code, studentId, paperId)

            if (!result.valid) {
                return res.status(400).json({
                    success: false,
                    message: result.message,
                })
            }

            res.json({
                success: true,
                message: result.message,
                data: result.paper,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    async getMyCoupon(req: Request, res: Response) {
        try {
            const { paperId } = req.params
            const studentId = (req as any).user.userId

            const coupon = await couponService.getStudentCoupon(studentId, paperId)

            if (!coupon) {
                return res.status(404).json({
                    success: false,
                    message: "No coupon found for this paper",
                })
            }

            res.json({
                success: true,
                data: coupon,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    async getPaperCoupons(req: Request, res: Response) {
        try {
            const { paperId } = req.params
            const teacherId = (req as any).user.userId

            const coupons = await couponService.getPaperCoupons(paperId, teacherId)

            res.json({
                success: true,
                data: coupons,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }

    async regenerateCoupons(req: Request, res: Response) {
        try {
            const { paperId } = req.params
            const teacherId = (req as any).user.userId

            const result = await couponService.regenerateCoupons(paperId, teacherId)

            res.json({
                success: true,
                message: "Coupons regenerated successfully",
                data: result,
            })
        } catch (error: any) {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message,
            })
        }
    }
}

export const couponController = new CouponController()
