import prisma from "@config/database"
import { AppError } from "@utils/errors"

export class StandardService {
  async createStandard(teacherId: string, name: string) {
    // Verify teacher exists
    const teacher = await prisma.user.findUnique({ where: { id: teacherId } })
    if (!teacher) {
      throw new AppError(404, "Teacher not found")
    }

    // Check for existing standard to avoid 500
    const existing = await prisma.standard.findUnique({
      where: {
        teacherId_name: { teacherId, name }
      }
    })

    if (existing) {
      // Or throw AppError(409, "Standard already exists") if preferred
      // For idempotency, user might just want the standard ID
      return existing
    }

    const standard = await prisma.standard.create({
      data: {
        name,
        teacherId,
      },
    })
    return standard
  }

  async getStandards(teacherId: string) {
    const standards = await prisma.standard.findMany({
      where: { teacherId },
      include: { subjects: true },
    })
    return standards
  }

  async getStandard(standardId: string, teacherId: string) {
    const standard = await prisma.standard.findUnique({
      where: { id: standardId },
      include: { subjects: true },
    })
    if (!standard || standard.teacherId !== teacherId) {
      throw new AppError(404, "Standard not found")
    }
    return standard
  }

  async updateStandard(standardId: string, teacherId: string, name: string) {
    const standard = await prisma.standard.findUnique({ where: { id: standardId } })
    if (!standard || standard.teacherId !== teacherId) {
      throw new AppError(404, "Standard not found")
    }

    const updatedStandard = await prisma.standard.update({
      where: { id: standardId },
      data: { name },
    })
    return updatedStandard
  }

  async deleteStandard(standardId: string, teacherId: string) {
    const standard = await prisma.standard.findUnique({ where: { id: standardId } })
    if (!standard || standard.teacherId !== teacherId) {
      throw new AppError(404, "Standard not found")
    }

    await prisma.standard.delete({ where: { id: standardId } })
    return { message: "Standard deleted successfully" }
  }
}

export const standardService = new StandardService()
