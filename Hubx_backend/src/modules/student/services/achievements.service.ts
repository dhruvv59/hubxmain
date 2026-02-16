import { prisma } from "@/config/database";

export class AchievementsService {
  /**
   * Seed default achievements into database
   * Call once during setup
   */
  async seedDefaultAchievements() {
    const defaultAchievements = [
      {
        title: "First Steps",
        description: "Complete your first assessment",
        icon: "star",
        color: "from-yellow-400 to-orange-500",
        type: "first_assessment",
        threshold: 1,
      },
      {
        title: "Quick Learner",
        description: "Score 90% or above in 5 assessments",
        icon: "zap",
        color: "from-blue-400 to-purple-500",
        type: "score_threshold",
        threshold: 5,
      },
      {
        title: "Streak Master",
        description: "Maintain a 7-day learning streak",
        icon: "target",
        color: "from-green-400 to-teal-500",
        type: "streak",
        threshold: 7,
      },
      {
        title: "Top Performer",
        description: "Rank in top 10 of your class",
        icon: "medal",
        color: "from-pink-400 to-red-500",
        type: "ranking",
        threshold: 10,
      },
      {
        title: "Champion",
        description: "Score perfect 100% in any assessment",
        icon: "crown",
        color: "from-purple-400 to-indigo-500",
        type: "perfect_score",
        threshold: 100,
      },
      {
        title: "Knowledge Seeker",
        description: "Complete 20 assessments",
        icon: "book-open",
        color: "from-orange-400 to-red-500",
        type: "assessment_count",
        threshold: 20,
      },
    ];

    for (const achievement of defaultAchievements) {
      await prisma.achievement.upsert({
        where: { id: achievement.title }, // Ensure unique
        update: achievement,
        create: {
          ...achievement,
          id: `ach_${achievement.type}`,
        },
      });
    }
  }

  /**
   * Get all achievements with user's progress
   */
  async getAchievements(studentId: string) {
    // Get all achievements
    const allAchievements = await prisma.achievement.findMany({
      orderBy: { createdAt: "asc" },
    });

    // Get user's earned achievements
    const earnedAchievements = await prisma.userAchievement.findMany({
      where: { userId: studentId },
      select: { achievementId: true, earnedAt: true },
    });

    const earnedIds = new Set(
      earnedAchievements.map((a) => a.achievementId)
    );
    const earnedMap = new Map(
      earnedAchievements.map((a) => [a.achievementId, a.earnedAt])
    );

    // Get user's exam stats for progress calculation
    const examStats = await prisma.examAttempt.findMany({
      where: { studentId },
      select: { percentage: true, totalMarks: true },
    });

    // Calculate progress for each achievement
    const achievements = allAchievements.map((achievement) => {
      const earned = earnedIds.has(achievement.id);
      let progress = 0;

      if (!earned) {
        // Calculate progress based on achievement type
        switch (achievement.type) {
          case "first_assessment":
            progress = examStats.length > 0 ? 100 : 0;
            break;

          case "score_threshold":
            const highScores = examStats.filter(
              (e) => e.percentage >= 90
            ).length;
            progress = Math.min(100, (highScores / (achievement.threshold || 1)) * 100);
            break;

          case "assessment_count":
            progress = Math.min(
              100,
              (examStats.length / (achievement.threshold || 1)) * 100
            );
            break;

          case "perfect_score":
            const perfect = examStats.filter((e) => e.percentage === 100).length;
            progress = perfect > 0 ? 100 : 0;
            break;

          default:
            progress = 0;
        }
      }

      return {
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        color: achievement.color,
        earned: earned,
        earnedDate: earned ? earnedMap.get(achievement.id) : null,
        progress: earned ? 100 : Math.round(progress),
        requirement: achievement.threshold,
      };
    });

    return achievements;
  }

  /**
   * Award achievement to user
   */
  async awardAchievement(studentId: string, achievementId: string) {
    try {
      const awarded = await prisma.userAchievement.create({
        data: {
          userId: studentId,
          achievementId,
        },
      });
      return true;
    } catch (error) {
      // Already earned, that's fine
      return false;
    }
  }

  /**
   * Check and award achievements based on exam attempt
   * Call this after exam submission
   */
  async checkAndAwardAchievements(studentId: string) {
    const examStats = await prisma.examAttempt.findMany({
      where: { studentId },
      select: { percentage: true, totalMarks: true },
    });

    // Award "First Steps" if first exam
    if (examStats.length === 1) {
      await this.awardAchievement(studentId, "ach_first_assessment");
    }

    // Award "Perfect Score" if any exam has 100%
    const hasPerf = examStats.some((e) => e.percentage === 100);
    if (hasPerf) {
      await this.awardAchievement(studentId, "ach_perfect_score");
    }

    // Award "Quick Learner" if 5 exams with 90%+
    const highScores = examStats.filter((e) => e.percentage >= 90).length;
    if (highScores >= 5) {
      await this.awardAchievement(studentId, "ach_score_threshold");
    }

    // Award "Knowledge Seeker" if 20+ exams
    if (examStats.length >= 20) {
      await this.awardAchievement(studentId, "ach_assessment_count");
    }
  }
}

export const achievementsService = new AchievementsService();
