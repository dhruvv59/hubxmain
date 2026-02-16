import { Router, Request, Response } from "express";
import { authenticate } from "@middlewares/auth";
import { supportTicketService } from "../services/ticket.service";
import {
  validateCreateTicket,
  validateListTickets,
  validateReplyTicket,
  handleValidationErrors,
} from "../validators/ticket.validator";

const router = Router();

/**
 * POST /api/v1/support/tickets
 * Create a new support ticket
 */
router.post(
  "/",
  authenticate,
  validateCreateTicket,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const studentId = (req as any).user?.id;
      const { subject, message, category, attachments } = req.body;

      const ticket = await supportTicketService.createTicket(studentId, {
        subject,
        message,
        category,
        attachments,
      });

      return res.status(201).json({
        success: true,
        message: "Support ticket created successfully",
        data: ticket,
      });
    } catch (error: any) {
      console.error("Create ticket error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create support ticket",
        requestId: (req as any).id,
      });
    }
  }
);

/**
 * GET /api/v1/support/tickets
 * Get paginated list of student's support tickets
 */
router.get(
  "/",
  authenticate,
  validateListTickets,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const studentId = (req as any).user?.id;
      const { status, page = 1, limit = 10 } = req.query;

      const result = await supportTicketService.getStudentTickets(studentId, {
        status: status as any,
        page: Number(page),
        limit: Number(limit),
      });

      return res.status(200).json({
        success: true,
        message: "Tickets fetched successfully",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error("List tickets error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch support tickets",
        requestId: (req as any).id,
      });
    }
  }
);

/**
 * GET /api/v1/support/tickets/:ticketId
 * Get single ticket with all replies
 */
router.get(
  "/:ticketId",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;
      const studentId = (req as any).user?.id;

      const ticket = await supportTicketService.getTicketDetail(
        ticketId,
        studentId
      );

      return res.status(200).json({
        success: true,
        message: "Ticket detail fetched successfully",
        data: ticket,
      });
    } catch (error: any) {
      console.error("Get ticket detail error:", error);

      if (error.status === 403) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }

      if (error.status === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to fetch ticket",
        requestId: (req as any).id,
      });
    }
  }
);

/**
 * POST /api/v1/support/tickets/:ticketId/reply
 * Add reply to support ticket
 */
router.post(
  "/:ticketId/reply",
  authenticate,
  validateReplyTicket,
  handleValidationErrors,
  async (req: Request, res: Response) => {
    try {
      const { ticketId } = req.params;
      const { message } = req.body;
      const userId = (req as any).user?.id;

      const reply = await supportTicketService.addReply(
        ticketId,
        userId,
        message
      );

      return res.status(201).json({
        success: true,
        message: "Reply added successfully",
        data: reply,
      });
    } catch (error: any) {
      console.error("Add reply error:", error);

      if (error.status === 404) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to add reply",
        requestId: (req as any).id,
      });
    }
  }
);

/**
 * PUT /api/v1/support/tickets/:ticketId/status (ADMIN ONLY)
 * Update ticket status
 */
router.put(
  "/:ticketId/status",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;

      // Only teachers/admins can update status
      if (!["TEACHER", "SUPER_ADMIN"].includes(user?.role)) {
        return res.status(403).json({
          success: false,
          message: "Only teachers/admins can update ticket status",
        });
      }

      const { ticketId } = req.params;
      const { status } = req.body;

      if (!["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status value",
        });
      }

      const result = await supportTicketService.updateTicketStatus(
        ticketId,
        status
      );

      return res.status(200).json({
        success: true,
        message: "Ticket status updated",
        data: result,
      });
    } catch (error: any) {
      console.error("Update ticket status error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update ticket status",
        requestId: (req as any).id,
      });
    }
  }
);

export default router;
