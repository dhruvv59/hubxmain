import Razorpay from "razorpay"
import crypto from "crypto"
import prisma from "@config/database"
import { AppError } from "@utils/errors"
import { PAYMENT_STATUS, PAPER_STATUS } from "@utils/constants"

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
})

export class PaymentService {
  async createOrder(studentId: string, paperId: string) {
    // Check if paper exists and is public
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
    })

    if (!paper || !paper.isPublic || paper.status !== PAPER_STATUS.PUBLISHED) {
      throw new AppError(404, "Paper not found or not available for purchase")
    }

    // Check if already purchased
    const existingPurchase = await prisma.paperPurchase.findUnique({
      where: { paperId_studentId: { paperId, studentId } },
    })

    if (existingPurchase) {
      throw new AppError(400, "Paper already purchased")
    }

    // Create Razorpay order
    // Fix: Receipt length must be <= 40 chars. Using timestamp + random suffix.
    // Critical data (paperId, studentId) is stored in 'notes'.
    const shortReceiptId = `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`

    const razorpayOrder = await razorpay.orders.create({
      amount: (paper.price || 0) * 100, // Convert to paise
      currency: "INR",
      receipt: shortReceiptId,
      notes: {
        paperId, // Include paperId in notes for webhook extraction
        studentId,
      },
    })

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        userId: studentId,
        orderId: razorpayOrder.id,
        amount: paper.price || 0,
        status: PAYMENT_STATUS.PENDING as any,
      },
    })

    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      paymentId: payment.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
    }
  }

  async verifyAndCompletePurchase(
    studentId: string,
    paymentData: {
      orderId: string
      paymentId: string
      signature: string
      paperId: string
    },
  ) {
    // Verify signature
    const body = `${paymentData.orderId}|${paymentData.paymentId}`
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(body)
      .digest("hex")

    if (expectedSignature !== paymentData.signature) {
      throw new AppError(400, "Invalid payment signature")
    }

    // Get payment record
    const payment = await prisma.payment.findUnique({
      where: { orderId: paymentData.orderId },
    })

    if (!payment) {
      throw new AppError(404, "Payment record not found")
    }

    if (payment.userId !== studentId) {
      throw new AppError(403, "Unauthorized payment verification")
    }

    // Verify with Razorpay API
    try {
      const razorpayPayment = await razorpay.payments.fetch(paymentData.paymentId)

      if (razorpayPayment.status !== "captured") {
        throw new AppError(400, "Payment not captured")
      }

      // Check if already purchased
      const existingPurchase = await prisma.paperPurchase.findUnique({
        where: { paperId_studentId: { paperId: paymentData.paperId, studentId } },
      })

      if (existingPurchase) {
        // Instead of erroring, return success (idempotency)
        // This handles cases where webhook might have already processed it
        console.log(`[Payment] Purchase already exists for user ${studentId}, paper ${paymentData.paperId}`)

        // Ensure payment is marked success if not already
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: PAYMENT_STATUS.SUCCESS as any }
        });

        return { payment, purchase: existingPurchase }
      }

      // Update payment
      const updatedPayment = await prisma.payment.update({
        where: { id: payment.id },
        data: {
          paymentId: paymentData.paymentId,
          signature: paymentData.signature,
          status: PAYMENT_STATUS.SUCCESS as any,
        },
      })

      // Create purchase record
      const purchase = await prisma.paperPurchase.create({
        data: {
          paperId: paymentData.paperId,
          studentId,
          paymentId: payment.id,
          price: payment.amount,
        },
      })

      return { payment: updatedPayment, purchase }
    } catch (error) {
      // Update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PAYMENT_STATUS.FAILED as any },
      })
      throw error
    }
  }

  async getPaymentHistory(studentId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit

    const payments = await prisma.payment.findMany({
      where: { userId: studentId },
      include: { purchases: { include: { paper: true } } },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    })

    const total = await prisma.payment.count({ where: { userId: studentId } })

    return {
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Verify if a user has access to a paper
   * Used for free coupon verification
   * 
   * @param studentId - User ID
   * @param paperId - Paper ID
   * @returns boolean - true if user has purchased the paper
   */
  async verifyAccess(studentId: string, paperId: string): Promise<boolean> {
    const purchase = await prisma.paperPurchase.findUnique({
      where: {
        paperId_studentId: {
          paperId,
          studentId,
        },
      },
    })

    return !!purchase
  }

  /**
   * NEW: Claim free access to paper (100% coupon or zero-price paper)
   * Solves: Free coupon flow where price becomes 0
   * Creates: Zero-value payment record + purchase record to grant access
   * 
   * @param studentId - Student's user ID
   * @param paperId - Paper ID to claim
   * @returns Purchase record confirming access granted
   */
  async claimFreeAccess(studentId: string, paperId: string) {
    // 1. Validate paper exists and is public
    const paper = await prisma.paper.findUnique({
      where: { id: paperId },
    })

    if (!paper || !paper.isPublic || paper.status !== PAPER_STATUS.PUBLISHED) {
      throw new AppError(404, "Paper not found or not available")
    }

    // 2. Check if already purchased (idempotency)
    const existingPurchase = await prisma.paperPurchase.findUnique({
      where: { paperId_studentId: { paperId, studentId } },
    })

    if (existingPurchase) {
      return {
        success: true,
        message: "Access already granted",
        purchase: existingPurchase,
      }
    }

    // 3. Create zero-value payment record (for tracking/audit trail)
    const payment = await prisma.payment.create({
      data: {
        userId: studentId,
        orderId: `FREE-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        amount: 0,
        status: PAYMENT_STATUS.SUCCESS as any,
        paymentId: `free-claim-${Date.now()}`,
        signature: "FREE_ACCESS",
      },
    })

    // 4. Create purchase record to grant access
    const purchase = await prisma.paperPurchase.create({
      data: {
        paperId,
        studentId,
        paymentId: payment.id,
        price: 0,
      },
    })

    return {
      success: true,
      message: "Free access granted successfully",
      purchase,
    }
  }

  /**
   * CRITICAL: Razorpay Webhook Handler
   * This ensures payments are processed ASYNCHRONOUSLY even if user closes browser
   * Handles: payment.captured event
   * 
   * @param webhookBody - Raw webhook body from Razorpay
   * @param webhookSignature - X-Razorpay-Signature header
   * @returns Processing result
   */
  async handleWebhook(webhookBody: any, webhookSignature: string) {
    // 1. Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
      .update(JSON.stringify(webhookBody))
      .digest("hex")

    if (expectedSignature !== webhookSignature) {
      throw new AppError(400, "Invalid webhook signature")
    }

    // 2. Handle payment.captured event
    if (webhookBody.event === "payment.captured") {
      const paymentEntity = webhookBody.payload.payment.entity
      const orderId = paymentEntity.order_id
      const razorpayPaymentId = paymentEntity.id

      // Find payment record by orderId
      const payment = await prisma.payment.findUnique({
        where: { orderId },
      })

      if (!payment) {
        console.error(`[Webhook] Payment not found for orderId: ${orderId}`)
        return { success: false, message: "Payment not found" }
      }

      // IDEMPOTENCY CHECK: Don't process if already successful
      if (payment.status === PAYMENT_STATUS.SUCCESS) {
        console.log(`[Webhook] Payment already processed: ${orderId}`)
        return { success: true, message: "Already processed" }
      }

      // Extract paperId from notes (primary)
      // We no longer rely on 'receipt' field for ID extraction due to length limits
      const paperId = paymentEntity.notes?.paperId

      if (!paperId) {
        console.error(`[Webhook] ERROR: Cannot extract paperId from notes. Payment Notes:`, paymentEntity.notes)
        // Attempt fallback or return error - WITHOUT paperId we cannot process purchase
        return { success: false, message: "Missing paperId in payment notes" }
      }

      const studentId = payment.userId

      try {
        // Check if purchase already exists (idempotency)
        const existingPurchase = await prisma.paperPurchase.findUnique({
          where: { paperId_studentId: { paperId, studentId } },
        })

        if (existingPurchase) {
          console.log(`[Webhook] Purchase already exists for paper: ${paperId}, student: ${studentId}`)
          // Update payment status anyway
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              paymentId: razorpayPaymentId,
              status: PAYMENT_STATUS.SUCCESS as any,
            },
          })
          return { success: true, message: "Purchase already exists" }
        }

        // Create purchase and update payment atomically
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: {
              paymentId: razorpayPaymentId,
              status: PAYMENT_STATUS.SUCCESS as any,
            },
          }),
          prisma.paperPurchase.create({
            data: {
              paperId,
              studentId,
              paymentId: payment.id,
              price: payment.amount,
            },
          }),
        ])

        console.log(`[Webhook] Successfully processed payment: ${orderId}`)
        return { success: true, message: "Payment processed successfully" }
      } catch (error) {
        console.error(`[Webhook] Error processing payment: ${orderId}`, error)
        throw error
      }
    }

    // Other events - log and ignore
    console.log(`[Webhook] Unhandled event type: ${webhookBody.event}`)
    return { success: true, message: "Event ignored" }
  }
}

export const paymentService = new PaymentService()
