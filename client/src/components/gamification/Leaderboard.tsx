import { useLeaderboard } from "@/hooks/use-gamification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy, Medal, User, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export function Leaderboard() {
  const { leaderboard, isLoading } = useLeaderboard();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Community Leaderboard
          </CardTitle>
          <CardDescription>
            Top members ranked by activity score
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Community Leaderboard
          </CardTitle>
          <CardDescription>
            Top members ranked by activity score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-muted-foreground">No activity recorded yet in the community.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getBadgeForRank = (rank: number) => {
    if (rank === 0) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank === 1) return <Medal className="h-4 w-4 text-gray-400" />;
    if (rank === 2) return <Medal className="h-4 w-4 text-amber-600" />;
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Community Leaderboard
        </CardTitle>
        <CardDescription>
          Top members ranked by activity score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {leaderboard.map((user, index) => (
            <div 
              key={user.id} 
              className={`
                flex items-center p-2 rounded-md 
                ${index === 0 ? 'bg-yellow-500/10 border border-yellow-500/20' : 
                 index === 1 ? 'bg-gray-300/10 border border-gray-300/20' : 
                 index === 2 ? 'bg-amber-600/10 border border-amber-600/20' : 
                 'bg-muted/5 border border-border'}
              `}
            >
              <div className="flex-shrink-0 w-8 text-center font-medium">
                {getBadgeForRank(index) || `#${index + 1}`}
              </div>
              <Avatar className="h-8 w-8 mr-3">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.displayName || user.username} />
                ) : (
                  <AvatarFallback>
                    {getInitials(user.displayName || user.username)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user.displayName || user.username}
                </p>
              </div>
              <div className="font-semibold text-sm flex items-center">
                {user.activityScore}
                <Trophy className="h-3 w-3 ml-1 text-primary" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}