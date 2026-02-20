import prisma from "@config/database"
import { AppError } from "@utils/errors"

export class SubjectService {
  async createSubject(standardId: string, teacherId: string, name: string, code?: string) {
    // Verify standard ownership
    const standard = await prisma.standard.findUnique({ where: { id: standardId } })
    if (!standard || standard.teacherId !== teacherId) {
      throw new AppError(404, "Standard not found")
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        standardId,
      },
    })
    return subject
  }

  async getSubjects(standardId: string, teacherId: string) {
    // Verify standard ownership
    const standard = await prisma.standard.findUnique({ where: { id: standardId } })
    if (!standard || standard.teacherId !== teacherId) {
      throw new AppError(404, "Standard not found")
    }

    const subjects = await prisma.subject.findMany({
      where: { standardId },
      include: { chapters: true },
    })
    return subjects
  }

  async getSubject(subjectId: string, standardId: string, teacherId: string) {
    // Verify standard ownership
    const standard = await prisma.standard.findUnique({ where: { id: standardId } })
    if (!standard || standard.teacherId !== teacherId) {
      throw new AppError(404, "Standard not found")
    }

    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: { chapters: true },
    })
    if (!subject || subject.standardId !== standardId) {
      throw new AppError(404, "Subject not found")
    }
    return subject
  }

  async updateSubject(subjectId: string, standardId: string, teacherId: string, name: string, code?: string) {
    // Verify standard ownership
    const standard = await prisma.standard.findUnique({ where: { id: standardId } })
    if (!standard || standard.teacherId !== teacherId) {
      throw new AppError(404, "Standard not found")
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject || subject.standardId !== standardId) {
      throw new AppError(404, "Subject not found")
    }

    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: { name, code },
    })
    return updatedSubject
  }

  async deleteSubject(subjectId: string, standardId: string, teacherId: string) {
    // Verify standard ownership
    const standard = await prisma.standard.findUnique({ where: { id: standardId } })
    if (!standard || standard.teacherId !== teacherId) {
      throw new AppError(404, "Standard not found")
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject || subject.standardId !== standardId) {
      throw new AppError(404, "Subject not found")
    }

    await prisma.subject.delete({ where: { id: subjectId } })
    return { message: "Subject deleted successfully" }
  }

  async createChapter(subjectId: string, standardId: string, teacherId: string, name: string, description?: string, sequence?: number) {
    // Verify standard ownership
    const standard = await prisma.standard.findUnique({ where: { id: standardId } })
    if (!standard || standard.teacherId !== teacherId) {
      throw new AppError(404, "Standard not found")
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject || subject.standardId !== standardId) {
      throw new AppError(404, "Subject not found")
    }

    const chapter = await prisma.chapter.create({
      data: {
        name,
        description,
        sequence,
        subjectId,
      },
    })
    // Add standardId to response for frontend use
    return { ...chapter, standardId }
  }

  async getChapters(subjectId: string, standardId: string, teacherId: string) {
    // Verify standard ownership
    const standard = await prisma.standard.findUnique({ where: { id: standardId } })
    if (!standard || standard.teacherId !== teacherId) {
      throw new AppError(404, "Standard not found")
    }

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject || subject.standardId !== standardId) {
      throw new AppError(404, "Subject not found")
    }

    const chapters = await prisma.chapter.findMany({
      where: { subjectId },
    })
    // Add standardId to each chapter for frontend use
    return chapters.map(ch => ({
      ...ch,
      standardId: standardId,
    }))
  }

  async updateChapter(chapterId: string, subjectId: string, standardId: string, teacherId: string, name: string, description?: string, sequence?: number) {
    // Verify standard ownership
    const standard = await prisma.standard.findUnique({ where: { id: standardId } })
    if (!standard || standard.teacherId !== teacherId) {
      throw new AppError(404, "Standard not found")
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true },
    })
    if (!chapter || chapter.subject.standardId !== standardId) {
      throw new AppError(404, "Chapter not found")
    }

    const updatedChapter = await prisma.chapter.update({
      where: { id: chapterId },
      data: { name, description, sequence },
    })
    // Add standardId to response for frontend use
    return { ...updatedChapter, standardId }
  }

  async deleteChapter(chapterId: string, subjectId: string, standardId: string, teacherId: string) {
    // Verify standard ownership
    const standard = await prisma.standard.findUnique({ where: { id: standardId } })
    if (!standard || standard.teacherId !== teacherId) {
      throw new AppError(404, "Standard not found")
    }

    const chapter = await prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { subject: true },
    })
    if (!chapter || chapter.subject.standardId !== standardId) {
      throw new AppError(404, "Chapter not found")
    }

    await prisma.chapter.delete({ where: { id: chapterId } })
    return { message: "Chapter deleted successfully" }
  }
}

export const subjectService = new SubjectService()
