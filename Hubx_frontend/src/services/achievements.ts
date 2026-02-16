/**
 * Student Achievements Service
 * Handles all API calls related to achievements
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

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
