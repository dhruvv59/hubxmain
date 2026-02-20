/**
 * Student Settings Service
 * Handles all API calls related to student settings
 */

import { API_BASE_URL } from "@/lib/api-config";
const API_BASE = API_BASE_URL;

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
   * Falls back to localStorage if API endpoint not available
   */
  async getSettings(studentId: string): Promise<SettingsData> {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/v1/student/settings/${studentId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
    } catch (error) {
      console.warn('[Settings] API call failed, using localStorage fallback', error);
    }

    // Fallback: Load from localStorage or return defaults
    const cachedSettings = localStorage.getItem(`settings_${studentId}`);
    if (cachedSettings) {
      return JSON.parse(cachedSettings);
    }

    // Return default settings
    return {
      id: studentId,
      userId: studentId,
      notifications: {
        email: true,
        push: false,
        assignments: true,
        assessments: true,
        announcements: false,
      },
      privacy: {
        profileVisibility: "public",
        showPerformance: true,
      },
      preferences: {
        language: "en",
        theme: "light",
      },
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Update student's settings
   * Falls back to localStorage if API endpoint not available
   */
  async updateSettings(
    studentId: string,
    data: UpdateSettingsPayload
  ): Promise<SettingsData> {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_BASE}/v1/student/settings/${studentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        return result.data;
      }
    } catch (error) {
      console.warn('[Settings] Update API call failed, saving to localStorage', error);
    }

    // Fallback: Save to localStorage
    const currentSettings = await this.getSettings(studentId);
    const updatedSettings = {
      ...currentSettings,
      notifications: { ...currentSettings.notifications, ...data.notifications },
      privacy: { ...currentSettings.privacy, ...data.privacy },
      preferences: { ...currentSettings.preferences, ...data.preferences },
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(`settings_${studentId}`, JSON.stringify(updatedSettings));
    return updatedSettings;
  },
};
