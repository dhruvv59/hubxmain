"use client";

import React, { useState, useEffect } from "react";
import { Trophy, Award, Star, Target, Zap, Medal, Crown, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  earned: boolean;
  earnedDate?: string;
  progress: number;
  requirement?: number;
}

// Icon mapping
const iconMap: Record<string, React.ComponentType<any>> = {
  star: Star,
  zap: Zap,
  target: Target,
  medal: Medal,
  crown: Crown,
  trophy: Trophy,
  award: Award,
};

export default function AchievementsPage() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load achievements from API
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        if (!user?.id) return;
        const { achievementsService } = await import("@/services/achievements");
        const data = await achievementsService.getAchievements(user.id);
        setAchievements(data);
      } catch (err: any) {
        console.error("Failed to load achievements:", err);
        setError(err?.message || "Failed to load achievements");
      } finally {
        setLoading(false);
      }
    };
    loadAchievements();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
          <p className="font-semibold">Failed to load achievements</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalEarned: achievements.filter((a) => a.earned).length,
    total: achievements.length,
    completionRate: Math.round((achievements.filter((a) => a.earned).length / Math.max(achievements.length, 1)) * 100),
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Achievements</h1>
        <p className="text-sm text-gray-500 mt-1">Track your learning milestones</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
          <Trophy className="h-8 w-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">
            {stats.totalEarned}/{stats.total}
          </p>
          <p className="text-sm opacity-80 mt-1">Achievements Unlocked</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 text-white">
          <Star className="h-8 w-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{stats.totalEarned * 250}</p>
          <p className="text-sm opacity-80 mt-1">Total Points</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white">
          <TrendingUp className="h-8 w-8 mb-3 opacity-80" />
          <p className="text-3xl font-bold">{stats.completionRate}%</p>
          <p className="text-sm opacity-80 mt-1">Completion Rate</p>
        </div>
      </div>

      {/* Achievements Grid */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4">All Achievements</h2>
        {achievements.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center">
            <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No achievements yet</p>
            <p className="text-sm text-gray-500 mt-1">Start taking assessments to unlock achievements!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const IconComponent = iconMap[achievement.icon] || Trophy;
              return (
                <div
                  key={achievement.id}
                  className={`bg-white rounded-2xl p-6 border-2 transition-all ${
                    achievement.earned
                      ? "border-gray-200 shadow-sm hover:shadow-md"
                      : "border-gray-100 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`h-14 w-14 rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center shrink-0 ${
                        !achievement.earned && "grayscale"
                      }`}
                    >
                      <IconComponent className="h-7 w-7 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900">{achievement.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>

                      {achievement.earned ? (
                        <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-medium">
                          <Award className="h-3.5 w-3.5" />
                          Earned on {new Date(achievement.earnedDate!).toLocaleDateString()}
                        </div>
                      ) : achievement.progress > 0 ? (
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                            <span>Progress</span>
                            <span className="font-bold">
                              {achievement.progress}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-gradient-to-r ${achievement.color} transition-all duration-500`}
                              style={{ width: `${achievement.progress}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 text-xs text-gray-400 font-medium">
                          🔒 Locked
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
