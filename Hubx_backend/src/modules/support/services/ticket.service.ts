import { prisma } from "@/config/database";
import { TicketStatus, TicketCategory } from "@prisma/client";

export class SupportTicketService {
  /**
   * Create a new support ticket
   */
  async createTicket(
    studentId: string,
    data: {
      subject: string;
      message: string;
      category: TicketCategory;
      attachments?: string[];
    }
  ) {
    const ticket = await prisma.supportTicket.create({
      data: {
        studentId,
        subject: data.subject,
        message: data.message,
        category: data.category,
      },
    });

    return {
      id: ticket.id,
      studentId: ticket.studentId,
      subject: ticket.subject,
      message: ticket.message,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }

  /**
   * Get paginated list of tickets for a student
   */
  async getStudentTickets(
    studentId: string,
    filters: {
      status?: TicketStatus;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { studentId };
    if (filters.status) {
      where.status = filters.status;
    }

    // Fetch tickets and total count
    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        select: {
          id: true,
          subject: true,
          message: true,
          status: true,
          priority: true,
          category: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { replies: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);

    return {
      data: tickets.map((t) => ({
        id: t.id,
        subject: t.subject,
        status: t.status,
        priority: t.priority,
        category: t.category,
        replyCount: t._count.replies,
        createdAt: t.createdAt,
        lastUpdatedAt: t.updatedAt,
      })),
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single ticket with replies
   */
  async getTicketDetail(ticketId: string, studentId?: string) {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        replies: {
          select: {
            id: true,
            message: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      throw {
        status: 404,
        message: "Ticket not found",
      };
    }

    // Verify ownership if studentId provided
    if (studentId && ticket.studentId !== studentId) {
      throw {
        status: 403,
        message: "You can only view your own tickets",
      };
    }

    return {
      id: ticket.id,
      subject: ticket.subject,
      message: ticket.message,
      category: ticket.category,
      status: ticket.status,
      priority: ticket.priority,
      resolution: ticket.resolution,
      createdAt: ticket.createdAt,
      resolvedAt: ticket.resolvedAt,
      replies: ticket.replies.map((r) => ({
        id: r.id,
        message: r.message,
        sender: `${r.user.firstName} ${r.user.lastName}`,
        createdAt: r.createdAt,
      })),
    };
  }

  /**
   * Add reply to support ticket
   */
  async addReply(ticketId: string, userId: string, message: string) {
    // Verify ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw {
        status: 404,
        message: "Ticket not found",
      };
    }

    const reply = await prisma.supportTicketReply.create({
      data: {
        ticketId,
        userId,
        message,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      id: reply.id,
      message: reply.message,
      sender: `${reply.user.firstName} ${reply.user.lastName}`,
      createdAt: reply.createdAt,
    };
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: TicketStatus) {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });

    return {
      id: ticket.id,
      status: ticket.status,
      updatedAt: ticket.updatedAt,
    };
  }

  /**
   * Resolve ticket
   */
  async resolveTicket(ticketId: string, resolution: string) {
    const ticket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: {
        status: "RESOLVED" as TicketStatus,
        resolution,
        resolvedAt: new Date(),
      },
    });

    return {
      id: ticket.id,
      status: ticket.status,
      resolvedAt: ticket.resolvedAt,
    };
  }
}

export const supportTicketService = new SupportTicketService();
