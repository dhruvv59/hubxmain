import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({
  errorFormat: "pretty",
})

prisma.$connect().catch((error) => {
  console.error("Failed to connect to database:", error)
  process.exit(1)
})

export default prisma
