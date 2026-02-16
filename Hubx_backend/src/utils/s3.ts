import { PutObjectCommand } from "@aws-sdk/client-s3"
import s3Client from "@config/s3"
import { v4 as uuidv4 } from "uuid"
import type { Express } from "express"

export const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
  const key = `exam-uploads/${uuidv4()}-${file.originalname}`

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || "hubx-exam-uploads",
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  })

  try {
    await s3Client.send(command)
    return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
  } catch (error) {
    console.error("S3 upload error:", error)
    throw new Error("Failed to upload image")
  }
}
