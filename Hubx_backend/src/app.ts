import express from "express"
import cors from "cors"
import morgan from "morgan"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import { errorHandler } from "@middlewares/errorHandler"

// Basic Env Validation
const requiredEnv = ["DATABASE_URL", "JWT_SECRET", "PORT"]
const missingEnv = requiredEnv.filter((key) => !process.env[key])
if (missingEnv.length > 0) {
  console.error(`CRITICAL: Missing required environment variables: ${missingEnv.join(", ")}`)
  // In production, we might want to exit. For dev robustness, we just warn.
  if (process.env.NODE_ENV === 'production') process.exit(1)
}

// Import routes
import authRoutes from "@modules/auth/auth.routes"
import teacherRoutes from "@modules/teacher/teacher.routes"
import studentRoutes from "@modules/student/student.routes"
import examRoutes from "@modules/exam/exam.routes"
import paymentRoutes from "@modules/payment/payment.routes"
import analyticsRoutes from "@modules/analytics/analytics.routes"
import chatRoutes from "@modules/chat/chat.routes"
import organizationRoutes from "@modules/organization/organization.routes"
import couponRoutes from "@modules/coupon/coupon.routes"
import doubtRoutes from "@modules/teacher/doubt.routes"
import ocrRoutes from "@modules/ocr/ocr.routes"
import notificationRoutes from "@modules/notification/notification.routes"
import systemRoutes from "@modules/system/system.routes"
import aiRoutes from "@modules/ai/ai.routes"

const app = express()

// Security Middleware (Helmet + Rate Limit)
app.use(helmet())
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs (increased for testing)
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later",
  })
)

// ============================================
// CORS Configuration - PRODUCTION SAFE
// ============================================
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
app.use(morgan("dev"))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ limit: "10mb", extended: true }))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/teacher", teacherRoutes)
app.use("/api/teacher", aiRoutes)
app.use("/api/student", studentRoutes)
app.use("/api/exam", examRoutes)
app.use("/api/payment", paymentRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/organization", organizationRoutes)
app.use("/api/coupons", couponRoutes)
app.use("/api/teacher", doubtRoutes)
app.use("/api/ocr", ocrRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/system", systemRoutes)

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  })
})

// Error handler
app.use(errorHandler)

export default app
