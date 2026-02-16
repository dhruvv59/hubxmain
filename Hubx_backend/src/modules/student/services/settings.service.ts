import { prisma } from "@/config/database";

export class SettingsService {
  /**
   * Get student settings with defaults
   * If settings don't exist, creates them with defaults
   */
  async getSettings(studentId: string) {
    let settings = await prisma.studentSettings.findUnique({
      where: { userId: studentId },
    });

    // Create with defaults if not exists
    if (!settings) {
      settings = await prisma.studentSettings.create({
        data: {
          userId: studentId,
        },
      });
    }

    return {
      id: settings.id,
      userId: settings.userId,
      notifications: {
        email: settings.emailNotifications,
        push: settings.pushNotifications,
        assignments: settings.assignmentNotifications,
        assessments: settings.assessmentNotifications,
        announcements: settings.announcementNotifications,
      },
      privacy: {
        profileVisibility: settings.profileVisibility,
        showPerformance: settings.showPerformance,
      },
      preferences: {
        language: settings.language,
        theme: settings.theme,
      },
      updatedAt: settings.updatedAt,
    };
  }

  /**
   * Update student settings
   * Merges provided values with existing settings
   */
  async updateSettings(
    studentId: string,
    data: {
      notifications?: {
        email?: boolean;
        push?: boolean;
        assignments?: boolean;
        assessments?: boolean;
        announcements?: boolean;
      };
      privacy?: {
        profileVisibility?: string;
        showPerformance?: boolean;
      };
      preferences?: {
        language?: string;
        theme?: string;
      };
    }
  ) {
    // Get existing settings or create with defaults
    let settings = await prisma.studentSettings.findUnique({
      where: { userId: studentId },
    });

    if (!settings) {
      settings = await prisma.studentSettings.create({
        data: {
          userId: studentId,
        },
      });
    }

    // Prepare update object
    const updateData: Record<string, any> = {};

    if (data.notifications) {
      if (data.notifications.email !== undefined)
        updateData.emailNotifications = data.notifications.email;
      if (data.notifications.push !== undefined)
        updateData.pushNotifications = data.notifications.push;
      if (data.notifications.assignments !== undefined)
        updateData.assignmentNotifications = data.notifications.assignments;
      if (data.notifications.assessments !== undefined)
        updateData.assessmentNotifications = data.notifications.assessments;
      if (data.notifications.announcements !== undefined)
        updateData.announcementNotifications = data.notifications.announcements;
    }

    if (data.privacy) {
      if (data.privacy.profileVisibility !== undefined)
        updateData.profileVisibility = data.privacy.profileVisibility;
      if (data.privacy.showPerformance !== undefined)
        updateData.showPerformance = data.privacy.showPerformance;
    }

    if (data.preferences) {
      if (data.preferences.language !== undefined)
        updateData.language = data.preferences.language;
      if (data.preferences.theme !== undefined)
        updateData.theme = data.preferences.theme;
    }

    // Update settings
    const updated = await prisma.studentSettings.update({
      where: { userId: studentId },
      data: updateData,
    });

    return {
      id: updated.id,
      userId: updated.userId,
      notifications: {
        email: updated.emailNotifications,
        push: updated.pushNotifications,
        assignments: updated.assignmentNotifications,
        assessments: updated.assessmentNotifications,
        announcements: updated.announcementNotifications,
      },
      privacy: {
        profileVisibility: updated.profileVisibility,
        showPerformance: updated.showPerformance,
      },
      preferences: {
        language: updated.language,
        theme: updated.theme,
      },
      updatedAt: updated.updatedAt,
    };
  }

  /**
   * Validate ownership of settings
   */
  async validateOwnership(studentId: string, requestingUserId: string) {
    if (studentId !== requestingUserId) {
      throw {
        status: 403,
        message: "You can only update your own settings",
      };
    }
  }
}

export const settingsService = new SettingsService();
