import "dotenv/config"
import { sendEmail } from "../utils/email"
import { nanoid } from "nanoid"

async function sendTestCoupon() {
    try {
        console.log("🚀 Sending Test Coupon Email...\n")

        // Test data
        const studentEmail = "ahirdhruv5050@gmail.com"
        const studentName = "Dhruv"
        const paperTitle = "Mathematics Midterm Exam"
        const organizationName = "Gujarat University"

        // Generate coupon code (same as real system)
        const generateCouponCode = (title: string): string => {
            const prefix = title
                .substring(0, 4)
                .toUpperCase()
                .replace(/[^A-Z]/g, "X")
            const uniqueId = nanoid(8).toUpperCase()
            return `${prefix}-${uniqueId}`
        }

        const couponCode = generateCouponCode(paperTitle)

        console.log("📋 Test Details:")
        console.log(`   Student Email: ${studentEmail}`)
        console.log(`   Student Name: ${studentName}`)
        console.log(`   Paper: ${paperTitle}`)
        console.log(`   School: ${organizationName}`)
        console.log(`   Coupon Code: ${couponCode}\n`)

        // Create HTML email (exact same as real system)
        const htmlContent = `
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

            <p>A new exam has been published by your teacher at <strong>${organizationName}</strong>.</p>

            <div class="details">
              <h3>📝 Paper Details:</h3>
              <ul>
                <li><strong>Title:</strong> ${paperTitle}</li>
                <li><strong>Subject:</strong> Mathematics</li>
                <li><strong>Standard:</strong> 10</li>
                <li><strong>Difficulty:</strong> Medium</li>
                <li><strong>Type:</strong> Exam</li>
                <li><strong>Duration:</strong> 60 minutes</li>
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

            <p style="margin-top: 20px;">Best regards,<br><strong>${organizationName}</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `

        console.log("📧 Sending email to: " + studentEmail)
        console.log("")

        await sendEmail({
            to: studentEmail,
            subject: `🎓 New Exam Available: ${paperTitle}`,
            html: htmlContent,
        })

        console.log("✅ SUCCESS!\n")
        console.log("═══════════════════════════════════════════════════════")
        console.log("EMAIL SENT SUCCESSFULLY!")
        console.log("═══════════════════════════════════════════════════════\n")

        console.log(`📧 Recipient: ahirdhruv5050@gmail.com`)
        console.log(`📌 Coupon Code: ${couponCode}`)
        console.log(`📍 From: support@lernen-hub.com`)
        console.log(`📚 Subject: 🎓 New Exam Available: ${paperTitle}\n`)

        console.log("Email Contains:")
        console.log("  ✅ School name: " + organizationName)
        console.log("  ✅ Paper title: " + paperTitle)
        console.log("  ✅ Paper details (Subject, Standard, Difficulty, Duration)")
        console.log("  ✅ Unique coupon code: " + couponCode)
        console.log("  ✅ Redemption instructions")
        console.log("  ✅ Professional HTML formatting")
        console.log("  ✅ Branding with blue header\n")

        console.log("═══════════════════════════════════════════════════════")
        console.log("🎉 THIS IS EXACTLY WHAT STUDENTS WILL RECEIVE!")
        console.log("═══════════════════════════════════════════════════════\n")

        console.log("When teacher publishes paper with 'Free Paper For Student':")
        console.log("  1️⃣  Teacher publishes paper with isFreeAccess = true")
        console.log("  2️⃣  Backend finds all students in school")
        console.log("  3️⃣  Generates unique coupon for EACH student")
        console.log("  4️⃣  Sends email (like above) to EACH student")
        console.log("  5️⃣  Student receives unique code")
        console.log("  6️⃣  Student redeems code for free access\n")

        console.log("Check your email: ahirdhruv5050@gmail.com")
        console.log("Look for email from: support@lernen-hub.com")
        console.log("Subject: 🎓 New Exam Available: " + paperTitle)

        process.exit(0)
    } catch (error) {
        console.error("❌ Error:", error)
        process.exit(1)
    }
}

sendTestCoupon()
