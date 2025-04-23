import { useLevel } from "@/hooks/use-gamification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Award, TrendingUp, Star } from "lucide-react";

export function UserLevel() {
  const { userLevel, isLoading } = useLevel();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Your Level
          </CardTitle>
          <CardDescription>
            Earn points by participating in the community
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!userLevel || !userLevel.currentLevel) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Your Level
          </CardTitle>
          <CardDescription>
            Earn points by participating in the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-muted-foreground">Start engaging with the community to earn your first level!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Your Level
        </CardTitle>
        <CardDescription>
          {userLevel.activityScore} total activity points
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start mb-4">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-lg flex items-center">
              Level {userLevel.currentLevel.level}: {userLevel.currentLevel.name}
              {userLevel.currentLevel.level >= 5 && (
                <Star className="h-4 w-4 ml-1 text-yellow-500 fill-yellow-500" />
              )}
            </h4>
            <p className="text-sm text-muted-foreground">{userLevel.currentLevel.description}</p>
          </div>
        </div>

        {userLevel.nextLevel && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {userLevel.nextLevel.level}</span>
              <span>{userLevel.progressToNextLevel}%</span>
            </div>
            <Progress value={userLevel.progressToNextLevel} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {userLevel.nextLevel.pointsRequired - userLevel.activityScore} more points needed for next level
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}