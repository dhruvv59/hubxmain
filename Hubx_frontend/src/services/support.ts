/**
 * Support Tickets Service
 * Handles all API calls related to support system
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  category: "payment" | "technical" | "content" | "account" | "other";
  status: "open" | "in_progress" | "resolved" | "closed" | "reopened";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
}

export interface SupportTicketDetail extends SupportTicket {
  resolution?: string;
  resolvedAt?: string;
  replies: Array<{
    id: string;
    message: string;
    sender: string;
    createdAt: string;
  }>;
}

export interface CreateTicketPayload {
  subject: string;
  message: string;
  category: "payment" | "technical" | "content" | "account" | "other";
  attachments?: string[];
}

export const supportService = {
  /**
   * Create a new support ticket
   */
  async createTicket(data: CreateTicketPayload): Promise<SupportTicket> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/v1/support/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      if (error.errors) {
        throw {
          message: error.message,
          errors: error.errors,
        };
      }
      throw new Error(error.message || "Failed to create support ticket");
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Get paginated list of student's support tickets
   */
  async getTickets(filters: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{
    data: SupportTicket[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();

    if (filters.status) params.append("status", filters.status);
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));

    const response = await fetch(
      `${API_BASE}/v1/support/tickets?${params.toString()}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch tickets");
    }

    const result = await response.json();
    return {
      data: result.data,
      pagination: result.pagination,
    };
  },

  /**
   * Get single ticket with all replies
   */
  async getTicketDetail(ticketId: string): Promise<SupportTicketDetail> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/v1/support/tickets/${ticketId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch ticket");
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Add reply to support ticket
   */
  async addReply(ticketId: string, message: string) {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${API_BASE}/v1/support/tickets/${ticketId}/reply`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to add reply");
    }

    const result = await response.json();
    return result.data;
  },
};
