import prisma from "@config/database"
import { AppError } from "@utils/errors"
import { sendEmail } from "@utils/email"
import { nanoid } from "nanoid"

export class CouponService {
    /**
     * Generate unique coupons for all eligible students when paper is published
     */
    async generateCouponsForPaper(paperId: string, organizationId: string, standard: number) {
        try {
            // 1. Get all students in the same organization
            const eligibleMembers = await prisma.organizationMember.findMany({
                where: {
                    organizationId,
                    role: "STUDENT",
                    isActive: true,
                },
                include: {
                    user: true,
                    organization: true,
                },
            })

            // 2. Get paper details
            const paper = await prisma.paper.findUnique({
                where: { id: paperId },
                include: {
                    subject: true,
                    teacher: true,
                },
            })

            if (!paper) {
                throw new AppError(404, "Paper not found")
            }

            // 3. Generate unique coupon for each student
            const coupons = []
            const emailPromises = []

            for (const member of eligibleMembers) {
                // Generate unique code
                const code = this.generateCouponCode(paper.title)

                // Create coupon in database
                const coupon = await prisma.paperCoupon.create({
                    data: {
                        paperId,
                        studentId: member.user.id,
                        code,
                    },
                })

                coupons.push(coupon)

                // 4. Send email to student (async, don't wait)
                emailPromises.push(
                    this.sendCouponEmail(member.user, paper, coupon.code, member.organization).catch((err) =>
                        console.error(`Failed to send email to ${member.user.email}:`, err),
                    ),
                )
            }

            // Send all emails in parallel (fire and forget)
            Promise.all(emailPromises).catch((err) => console.error("Email sending errors:", err))

            return {
                totalCoupons: coupons.length,
                coupons,
            }
        } catch (error: any) {
            console.error("Error generating coupons:", error)
            // Don't throw - coupon generation failure shouldn't block paper publishing
            return {
                totalCoupons: 0,
                coupons: [],
                error: error.message,
            }
        }
    }

    /**
     * Generate unique coupon code
     */
    private generateCouponCode(paperTitle: string): string {
        const prefix = paperTitle
            .substring(0, 4)
            .toUpperCase()
            .replace(/[^A-Z]/g, "X")

        const uniqueId = nanoid(8).toUpperCase()

        return `${prefix}-${uniqueId}`
    }

    /**
     * Send coupon email to student
     */
    private async sendCouponEmail(student: any, paper: any, couponCode: string, organization: any) {
        const emailContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
          .coupon-box { background: #fff; border: 2px dashed #4F46E5; padding: 20px; margin: 20px 0; text-align: center; border-radius: 5px; }
          .coupon-code { font-size: 24px; font-weight: bold; color: #4F46E5; letter-spacing: 2px; }
          .details { background: white; padding: 15px; margin: 15px 0; border-left: 4px solid #4F46E5; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          ul { padding-left: 20px; }
          li { margin: 8px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎓 New Exam Available!</h2>
          </div>
          <div class="content">
            <p>Dear ${student.firstName} ${student.lastName},</p>
            
            <p>A new exam has been published by your teacher at <strong>${organization.name}</strong>.</p>
            
            <div class="details">
              <h3>📝 Paper Details:</h3>
              <ul>
                <li><strong>Title:</strong> ${paper.title}</li>
                <li><strong>Subject:</strong> ${paper.subject.name}</li>
                <li><strong>Standard:</strong> ${paper.standard}</li>
                <li><strong>Difficulty:</strong> ${paper.difficulty}</li>
                <li><strong>Type:</strong> ${paper.type}</li>
                ${paper.duration ? `<li><strong>Duration:</strong> ${paper.duration} minutes</li>` : ""}
              </ul>
            </div>
            
            <div class="coupon-box">
              <h3>🎫 Your Exclusive Coupon Code:</h3>
              <div class="coupon-code">${couponCode}</div>
            </div>
            
            <div class="details">
              <h3>⚠️ Important:</h3>
              <ul>
                <li>This coupon code is <strong>unique to you</strong> and can only be used <strong>once</strong></li>
                <li>Use this code to access the exam for <strong>free</strong></li>
                <li>Do not share this code with others</li>
                <li>Login to your account and enter this coupon code to start the exam</li>
              </ul>
            </div>
            
            <p style="margin-top: 20px;">Best regards,<br><strong>${organization.name}</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `

        await sendEmail({
            to: student.email,
            subject: `New Exam Available: ${paper.title}`,
            html: emailContent,
        })
    }

    /**
     * Validate and use coupon code
     */
    async validateAndUseCoupon(code: string, studentId: string, paperId: string) {
        // 1. Find coupon
        const coupon = await prisma.paperCoupon.findUnique({
            where: { code },
            include: {
                paper: {
                    include: {
                        subject: true,
                    },
                },
                student: true,
            },
        })

        // 2. Validation checks
        if (!coupon) {
            return {
                valid: false,
                message: "Invalid coupon code",
            }
        }

        if (coupon.paperId !== paperId) {
            return {
                valid: false,
                message: "This coupon is not valid for this paper",
            }
        }

        // Debug logging to identify the issue
        console.log("🔍 Coupon Validation Debug:")
        console.log("Coupon studentId:", coupon.studentId)
        console.log("Logged-in studentId:", studentId)
        console.log("Match:", coupon.studentId === studentId)
        console.log("Student email from coupon:", coupon.student.email)

        if (coupon.studentId !== studentId) {
            return {
                valid: false,
                message: "This coupon is not assigned to you",
            }
        }

        if (coupon.isUsed) {
            return {
                valid: false,
                message: `Coupon code already used on ${coupon.usedAt?.toLocaleDateString()}`,
            }
        }

        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            return {
                valid: false,
                message: "Coupon code has expired",
            }
        }

        // 3. Mark coupon as used
        await prisma.paperCoupon.update({
            where: { id: coupon.id },
            data: {
                isUsed: true,
                usedAt: new Date(),
            },
        })

        // 4. Create a dummy payment record for coupon redemption
        const payment = await prisma.payment.create({
            data: {
                userId: studentId,
                orderId: `COUPON_${coupon.id}`,
                amount: 0,
                status: "SUCCESS",
            },
        })

        // 5. Grant access to paper (create purchase record with 0 price)
        await prisma.paperPurchase.create({
            data: {
                paperId,
                studentId,
                price: 0,
                paymentId: payment.id,
            },
        })

        return {
            valid: true,
            message: "Coupon applied successfully! You now have access to this paper.",
            paper: coupon.paper,
        }
    }

    /**
     * Check if student has coupon for a paper
     */
    async getStudentCoupon(studentId: string, paperId: string) {
        const coupon = await prisma.paperCoupon.findUnique({
            where: {
                paperId_studentId: {
                    paperId,
                    studentId,
                },
            },
            include: {
                paper: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                    },
                },
            },
        })

        return coupon
    }

    /**
     * Get all coupons for a paper (teacher view)
     */
    async getPaperCoupons(paperId: string, teacherId: string) {
        // Verify teacher owns the paper
        const paper = await prisma.paper.findFirst({
            where: { id: paperId, teacherId },
        })

        if (!paper) {
            throw new AppError(404, "Paper not found")
        }

        const coupons = await prisma.paperCoupon.findMany({
            where: { paperId },
            include: {
                student: {
                    select: {
                        id: true,
                        email: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })

        return coupons
    }

    /**
     * Regenerate coupons for a paper (admin/teacher action)
     */
    async regenerateCoupons(paperId: string, teacherId: string) {
        // Verify teacher owns the paper
        const paper = await prisma.paper.findFirst({
            where: { id: paperId, teacherId },
            include: {
                teacher: {
                    include: {
                        organizationMemberships: {
                            where: { isActive: true },
                        },
                    },
                },
            },
        })

        if (!paper) {
            throw new AppError(404, "Paper not found")
        }

        // Get teacher's organization
        const membership = paper.teacher.organizationMemberships[0]

        if (!membership) {
            throw new AppError(400, "Teacher is not part of any organization")
        }

        // Delete existing unused coupons
        await prisma.paperCoupon.deleteMany({
            where: {
                paperId,
                isUsed: false,
            },
        })

        // Generate new coupons
        const result = await this.generateCouponsForPaper(paperId, membership.organizationId, paper.standard)

        return result
    }
}

export const couponService = new CouponService()
