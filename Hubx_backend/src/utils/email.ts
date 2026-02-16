import nodemailer from "nodemailer"

// Create email transporter
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export interface EmailOptions {
    to: string
    subject: string
    html: string
}

export async function sendEmail(options: EmailOptions) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || "HubX Platform <noreply@hubx.com>",
            to: options.to,
            subject: options.subject,
            html: options.html,
        })
        console.log(`Email sent successfully to ${options.to}`)
    } catch (error) {
        console.error(`Failed to send email to ${options.to}:`, error)
        // Don't throw error - email failure shouldn't block the main flow
    }
}
