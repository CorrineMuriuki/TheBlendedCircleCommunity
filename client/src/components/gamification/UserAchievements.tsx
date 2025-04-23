import { useAchievements } from "@/hooks/use-gamification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Award, Medal, Lock, RefreshCw } from "lucide-react";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/utils";
import { achievementTypeEnum } from "@shared/schema";

// Helper function to get achievement requirement text based on type
const getAchievementRequirementText = (type: string, requiredValue: number): string => {
  switch (type) {
    case 'post_count':
      return `Make ${requiredValue} posts`;
    case 'event_attendance':
      return `Attend ${requiredValue} events`;
    case 'profile_completion':
      return `Complete ${requiredValue}% of your profile`;
    case 'referrals':
      return `Refer ${requiredValue} new members`;
    case 'comment_count':
      return `Add ${requiredValue} comments`;
    case 'longevity':
      return `Be a member for ${requiredValue} days`;
    case 'contribution':
      return `Contribute ${requiredValue} times to the community`;
    default:
      return `Complete ${requiredValue} actions`;
  }
};

export function UserAchievements() {
  const { 
    achievements, 
    userAchievements, 
    isLoading, 
    checkAchievementsMutation 
  } = useAchievements();

  const handleCheckAchievements = () => {
    checkAchievementsMutation.mutate();
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Medal className="h-5 w-5 text-primary" />
            Your Achievements
          </CardTitle>
          <CardDescription>
            Track your progress and unlock rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  // Map of achievement IDs that the user has unlocked
  const unlockedAchievements = new Map(
    userAchievements.map(ua => [ua.achievementId, ua])
  );
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Medal className="h-5 w-5 text-primary" />
              Your Achievements
            </CardTitle>
            <CardDescription>
              {userAchievements.length} of {achievements.length} achievements unlocked
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleCheckAchievements}
            disabled={checkAchievementsMutation.isPending}
          >
            {checkAchievementsMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Check
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {achievements.map(achievement => {
            const isUnlocked = unlockedAchievements.has(achievement.id);
            const userAchievement = unlockedAchievements.get(achievement.id);
            
            return (
              <TooltipProvider key={achievement.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div 
                      className={`
                        relative rounded-lg p-3 border flex flex-col items-center text-center
                        ${isUnlocked ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-border'}
                      `}
                    >
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center mb-2
                        ${isUnlocked ? 'bg-primary/10' : 'bg-muted'}
                      `}>
                        {isUnlocked ? (
                          <Award className="h-6 w-6 text-primary" />
                        ) : (
                          <Lock className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <h4 className={`text-sm font-medium ${!isUnlocked && 'text-muted-foreground'}`}>
                        {achievement.name}
                      </h4>
                      {isUnlocked && userAchievement && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Earned {formatDate(new Date(userAchievement.earnedAt))}
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="space-y-1 max-w-xs">
                      <p className="font-semibold">{achievement.name}</p>
                      <p className="text-sm">{achievement.description}</p>
                      {!isUnlocked && (
                        <p className="text-xs text-muted-foreground italic">
                          {getAchievementRequirementText(achievement.type, achievement.requiredValue)}
                        </p>
                      )}
                      {isUnlocked && (
                        <p className="text-xs text-green-500">
                          +{achievement.pointsAwarded} activity points earned
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}