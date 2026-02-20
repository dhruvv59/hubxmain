import "dotenv/config"
import prisma from "../config/database"
import { sendEmail } from "../utils/email"
import { nanoid } from "nanoid"

async function testCouponEmail() {
    try {
        console.log("🚀 Testing Coupon Generation & Email System...\n")

        // Test email
        const testEmail = "ahirdhruv5050@gmail.com"
        const studentName = "Dhruv"

        // Mock paper data (same structure as real)
        const mockPaper = {
            id: "paper-test-123",
            title: "Mathematics Midterm Exam",
            subject: {
                name: "Mathematics",
            },
            standard: 10,
            difficulty: "Medium",
            type: "Exam",
            duration: 60,
        }

        // Mock organization
        const mockOrganization = {
            name: "Lernen Hub School",
        }

        // Generate coupon code (same logic as real)
        const generateCouponCode = (paperTitle: string): string => {
            const prefix = paperTitle
                .substring(0, 4)
                .toUpperCase()
                .replace(/[^A-Z]/g, "X")
            const uniqueId = nanoid(8).toUpperCase()
            return `${prefix}-${uniqueId}`
        }

        const couponCode = generateCouponCode(mockPaper.title)

        console.log("📋 Test Data:")
        console.log(`  Student Email: ${testEmail}`)
        console.log(`  Student Name: ${studentName}`)
        console.log(`  Paper: ${mockPaper.title}`)
        console.log(`  Organization: ${mockOrganization.name}`)
        console.log(`  Generated Coupon Code: ${couponCode}\n`)

        // Create the same HTML email as real system
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
            <p>Dear ${studentName},</p>

            <p>A new exam has been published by your teacher at <strong>${mockOrganization.name}</strong>.</p>

            <div class="details">
              <h3>📝 Paper Details:</h3>
              <ul>
                <li><strong>Title:</strong> ${mockPaper.title}</li>
                <li><strong>Subject:</strong> ${mockPaper.subject.name}</li>
                <li><strong>Standard:</strong> ${mockPaper.standard}</li>
                <li><strong>Difficulty:</strong> ${mockPaper.difficulty}</li>
                <li><strong>Type:</strong> ${mockPaper.type}</li>
                <li><strong>Duration:</strong> ${mockPaper.duration} minutes</li>
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

            <p style="margin-top: 20px;">Best regards,<br><strong>${mockOrganization.name}</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `

        console.log("📧 Sending email...\n")

        await sendEmail({
            to: testEmail,
            subject: `🎓 New Exam Available: ${mockPaper.title}`,
            html: emailContent,
        })

        console.log("✅ SUCCESS!\n")
        console.log("═══════════════════════════════════════════")
        console.log("Email sent successfully to: ahirdhruv5050@gmail.com")
        console.log("═══════════════════════════════════════════\n")

        console.log("📬 Check your Gmail inbox now!")
        console.log(`📌 Coupon Code: ${couponCode}`)
        console.log("\nEmail contains:")
        console.log("  ✓ Paper details (Title, Subject, Standard, Difficulty)")
        console.log("  ✓ Unique coupon code")
        console.log("  ✓ Professional HTML formatting")
        console.log("  ✓ Redemption instructions")
        console.log("\n🎉 This is exactly what students will receive when teachers publish papers!")

        process.exit(0)
    } catch (error) {
        console.error("❌ Error:", error)
        process.exit(1)
    }
}

testCouponEmail()
