/**
 * Student Achievements Service
 * Handles all API calls related to achievements
 */

import { API_BASE_URL } from "@/lib/api-config";
const API_BASE = API_BASE_URL;

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedDate?: string;
  progress: number; // 0-100
  requirement?: number;
}

export const achievementsService = {
  /**
   * Fetch student's achievements with progress
   */
  async getAchievements(studentId: string): Promise<Achievement[]> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/v1/student/achievements/${studentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch achievements");
    }

    const result = await response.json();
    return result.data;
  },
};
