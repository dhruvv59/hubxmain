/**
 * Student Profile Service
 * Handles all API calls related to student profile management
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api";

interface ProfileData {
  id: string;
  email: string;
  fullName: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

export const profileService = {
  /**
   * Fetch current user's profile
   */
  async getProfile(studentId: string): Promise<ProfileData> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/v1/student/profile/${studentId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch profile");
    }

    const result = await response.json();
    return result.data;
  },

  /**
   * Update student's profile
   */
  async updateProfile(
    studentId: string,
    data: UpdateProfilePayload
  ): Promise<ProfileData> {
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE}/v1/student/profile/${studentId}`, {
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
      throw new Error(error.message || "Failed to update profile");
    }

    const result = await response.json();
    return result.data;
  },
};
