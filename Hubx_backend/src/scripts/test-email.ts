import "dotenv/config"
import { sendEmail } from "../utils/email"

async function testEmail() {
    try {
        console.log("🚀 Testing email service...")
        console.log("Environment variables:")
        console.log("  SMTP_HOST:", process.env.SMTP_HOST)
        console.log("  SMTP_PORT:", process.env.SMTP_PORT)
        console.log("  SMTP_USER:", process.env.SMTP_USER)
        console.log("  SMTP_FROM:", process.env.SMTP_FROM)
        console.log("")

        const testEmail = "ahirdhruv5050@gmail.com" // Your test email

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
            <h2>🎓 Test Email - HubX Platform</h2>
          </div>
          <div class="content">
            <p>Dear Test User,</p>

            <p>This is a <strong>TEST EMAIL</strong> from HubX Platform to verify email service is working.</p>

            <div class="details">
              <h3>📝 Test Paper Details:</h3>
              <ul>
                <li><strong>Title:</strong> Mathematics Midterm Exam</li>
                <li><strong>Subject:</strong> Mathematics</li>
                <li><strong>Standard:</strong> 10</li>
                <li><strong>Difficulty:</strong> Medium</li>
                <li><strong>Type:</strong> Exam</li>
                <li><strong>Duration:</strong> 60 minutes</li>
              </ul>
            </div>

            <div class="coupon-box">
              <h3>🎫 Your Test Coupon Code:</h3>
              <div class="coupon-code">TEST-2024-XYZABC</div>
            </div>

            <div class="details">
              <h3>✅ What This Means:</h3>
              <ul>
                <li>Email service is <strong>WORKING PERFECTLY</strong> ✓</li>
                <li>SMTP configuration is correct ✓</li>
                <li>HTML formatting displays properly ✓</li>
                <li>Students will receive coupon emails when papers are published ✓</li>
              </ul>
            </div>

            <p style="margin-top: 20px;">Best regards,<br><strong>HubX Platform</strong></p>
          </div>
          <div class="footer">
            <p>This is a test email. Please disregard if testing is complete.</p>
          </div>
        </div>
      </body>
      </html>
    `

        console.log("📧 Sending test email to:", testEmail)
        await sendEmail({
            to: testEmail,
            subject: "🧪 HubX Platform - Email Service Test",
            html: htmlContent,
        })

        console.log("✅ Email sent successfully!")
        console.log("📬 Check your inbox for the test email")
        process.exit(0)
    } catch (error) {
        console.error("❌ Error sending email:", error)
        process.exit(1)
    }
}

testEmail()
