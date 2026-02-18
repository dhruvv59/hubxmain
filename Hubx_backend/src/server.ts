import "dotenv/config"
import app from "./app.js"
import { createServer } from "http"
import { Server } from "socket.io"
import { initializeSocketGateway } from "@modules/chat/socket.gateway"
import { startBackgroundJobs, stopBackgroundJobs } from "@jobs/index.js"

const PORT = process.env.PORT || 8000

// Create HTTP server
const httpServer = createServer(app)

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Initialize Socket Gateway
initializeSocketGateway(io)

// Start background jobs (exam timer worker, etc.)
startBackgroundJobs()

const server = httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Socket.IO initialized`)
})

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully...")
  stopBackgroundJobs()
  server.close(() => {
    console.log("Server closed")
    process.exit(0)
  })
})

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully...")
  stopBackgroundJobs()
  server.close(() => {
    console.log("Server closed")
    process.exit(0)
  })
})
