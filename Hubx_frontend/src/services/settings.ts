/**
 * Student Settings Service
 * Handles all API calls related to student settings
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

export interface SettingsData {
  id: string;
  userId: string;
  notifications: {
    email: boolean;
    push: boolean;
    assignments: boolean;
    assessments: boolean;
    announcements: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "friends";
    showPerformance: boolean;
  };
  preferences: {
    language: "en" | "gu" | "hi";
    theme: "light" | "dark";
  };
  updatedAt: string;
}

export interface UpdateSettingsPayload {
  notifications?: Partial<SettingsData["notifications"]>;
  privacy?: Partial<SettingsData["privacy"]>;
  preferences?: Partial<SettingsData["preferences"]>;
}

export const settingsService = {
  /**
   * Fetch current user's settings
   */
  async getSettings(studentId: string): Promise<SettingsData> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/v1/student/settings/${studentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch settings");
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Update student's settings
   */
  async updateSettings(
    studentId: string,
    data: UpdateSettingsPayload
  ): Promise<SettingsData> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/v1/student/settings/${studentId}`, {
      method: "PUT",
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
      throw new Error(error.message || "Failed to update settings");
    }

    const result = await response.json();
    return result.data;
  },
};
