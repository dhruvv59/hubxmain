/**
 * NotificationTransformer
 * Standardized transformation of database notifications to frontend format
 *
 * Handles multiple notification types uniformly and enriches with metadata
 */
export class NotificationTransformer {
  /**
   * Transform database notification to frontend format
   */
  static toFrontendFormat(notification: any) {
    return {
      id: notification.id,
      avatar: this.getAvatarForType(notification.type),
      author: this.getAuthorName(notification),
      text: this.formatMessage(notification),
    }
  }

  /**
   * Get avatar based on notification type
   * Use system icons or sender avatars
   */
  private static getAvatarForType(type: string): string | undefined {
    const typeAvatarMap: Record<string, string> = {
      EXAM_RESULT: "/icons/result.svg",
      WEAK_AREA: "/icons/warning.svg",
      ACHIEVEMENT: "/icons/trophy.svg",
      ASSIGNMENT: "/icons/assignment.svg",
      DEADLINE: "/icons/clock.svg",
      MESSAGE: "/icons/message.svg",
    }
    return typeAvatarMap[type]
  }

  /**
   * Get author name based on notification type
   */
  private static getAuthorName(notification: any): string {
    if (notification.senderName) {
      return notification.senderName
    }

    const authorMap: Record<string, string> = {
      SYSTEM: "HubX System",
      TEACHER: "Your Teacher",
      WEAK_AREA: "AI Detector",
      ACHIEVEMENT: "HubX Awards",
    }

    return authorMap[notification.source] || "HubX"
  }

  /**
   * Format notification message for display
   */
  private static formatMessage(notification: any): string {
    if (notification.message) {
      return notification.message
    }

    const typeMessageMap: Record<string, string> = {
      EXAM_RESULT: `You scored {score}% in {paper}`,
      WEAK_AREA: `Detected weakness in {topic} ({score}%)`,
      ACHIEVEMENT: `Great job! You've {achievement}`,
      DEADLINE: `Exam deadline approaching: {paper}`,
    }

    return typeMessageMap[notification.type] || notification.title
  }

  /**
   * Transform array of notifications
   */
  static toFrontendFormatArray(notifications: any[]) {
    return notifications.map(n => this.toFrontendFormat(n))
  }
}
