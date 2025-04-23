import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Achievement, Level, ActivityLog, UserAchievement } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface UserLevel {
  currentLevel: Level | null;
  nextLevel: Level | null;
  activityScore: number;
  progressToNextLevel: number;
}

interface UserAchievementDetailed extends UserAchievement {
  achievement: Achievement;
}

interface CheckAchievementsResult {
  newAchievements: UserAchievement[];
  currentLevel: Level | null;
  totalAchievements: number;
}

type LeaderboardUser = {
  id: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  activityScore: number;
};

export function useAchievements() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: achievements = [], isLoading: isLoadingAchievements } = useQuery({
    queryKey: ["/api/achievements"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/achievements");
      return await res.json() as Achievement[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: userAchievements = [], isLoading: isLoadingUserAchievements } = useQuery({
    queryKey: ["/api/user-achievements"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user-achievements");
      return await res.json() as UserAchievementDetailed[];
    },
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });

  const checkAchievementsMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/check-achievements");
      return await res.json() as CheckAchievementsResult;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/user-achievements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user-level"] });
      
      if (data.newAchievements.length > 0) {
        toast({
          title: "New Achievements Unlocked!",
          description: `You've earned ${data.newAchievements.length} new achievement${data.newAchievements.length > 1 ? 's' : ''}!`,
          variant: "default",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to check achievements: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    achievements,
    userAchievements,
    isLoading: isLoadingAchievements || isLoadingUserAchievements,
    checkAchievementsMutation,
  };
}

export function useLevel() {
  const { user } = useAuth();

  const { data: levels = [], isLoading: isLoadingLevels } = useQuery({
    queryKey: ["/api/levels"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/levels");
      return await res.json() as Level[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  const { data: userLevel, isLoading: isLoadingUserLevel } = useQuery({
    queryKey: ["/api/user-level"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/user-level");
      return await res.json() as UserLevel;
    },
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    levels,
    userLevel,
    isLoading: isLoadingLevels || isLoadingUserLevel,
  };
}

export function useActivityLogs() {
  const { user } = useAuth();

  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ["/api/activity-logs"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/activity-logs");
      return await res.json() as ActivityLog[];
    },
    enabled: !!user,
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    activityLogs,
    isLoading,
  };
}

export function useLeaderboard() {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ["/api/leaderboard"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/leaderboard");
      return await res.json() as LeaderboardUser[];
    },
    staleTime: 1000 * 60 * 3, // 3 minutes
  });

  return {
    leaderboard,
    isLoading,
  };
}