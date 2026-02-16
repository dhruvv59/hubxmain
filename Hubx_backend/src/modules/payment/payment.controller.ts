import type { Response } from "express"
import { paymentService } from "./payment.service"
import { sendResponse, sendError } from "@utils/helpers"
import { asyncHandler } from "@utils/errors"
import type { AuthRequest } from "@middlewares/auth"

export class PaymentController {
  createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.body

    if (!paperId) {
      return sendError(res, 400, "Paper ID is required")
    }

    const order = await paymentService.createOrder(req.user!.userId, paperId)
    sendResponse(res, 200, "Order created successfully", order)
  })

  verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { orderId, paymentId, signature, paperId } = req.body

    if (!orderId || !paymentId || !signature || !paperId) {
      return sendError(res, 400, "Missing required fields")
    }

    const result = await paymentService.verifyAndCompletePurchase(req.user!.userId, {
      orderId,
      paymentId,
      signature,
      paperId,
    })
    sendResponse(res, 200, "Payment verified and purchase completed", result)
  })

  getPaymentHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = Number.parseInt(req.query.page as string) || 1
    const limit = Number.parseInt(req.query.limit as string) || 10

    const result = await paymentService.getPaymentHistory(req.user!.userId, page, limit)
    sendResponse(res, 200, "Payment history fetched successfully", result)
  })

  /**
   * Verify if user has access to a paper
   * Used for free coupon verification before showing success
   */
  verifyAccess = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.params

    if (!paperId) {
      return sendError(res, 400, "Paper ID is required")
    }

    const hasAccess = await paymentService.verifyAccess(req.user!.userId, paperId)
    sendResponse(res, 200, "Access verified", { hasAccess })
  })

  /**
   * NEW: Claim free access to paper (100% coupon scenario)
   * Solves: Free coupon flow where price is 0
   * Creates: Zero-value payment + purchase record
   */
  claimFreeAccess = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { paperId } = req.body

    if (!paperId) {
      return sendError(res, 400, "Paper ID is required")
    }

    const result = await paymentService.claimFreeAccess(req.user!.userId, paperId)
    sendResponse(res, 200, result.message, result)
  })

  /**
   * WEBHOOK HANDLER - No authentication required
   * Razorpay sends webhooks to this endpoint
   */
  handleWebhook = asyncHandler(async (req: any, res: Response) => {
    const webhookSignature = req.headers["x-razorpay-signature"]

    if (!webhookSignature) {
      return sendError(res, 400, "Missing webhook signature")
    }

    const result = await paymentService.handleWebhook(req.body, webhookSignature)
    sendResponse(res, 200, result.message, result)
  })
}

export const paymentController = new PaymentController()
