import { useActivityLogs } from "@/hooks/use-gamification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  Users, 
  Calendar, 
  ShoppingCart, 
  Award, 
  Activity as ActivityIcon, 
  Loader2 
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const getActivityIcon = (activityType: string) => {
  switch (activityType) {
    case 'post_created':
      return <MessageSquare className="h-4 w-4" />;
    case 'chat_joined':
      return <Users className="h-4 w-4" />;
    case 'event_attended':
      return <Calendar className="h-4 w-4" />;
    case 'product_purchased':
      return <ShoppingCart className="h-4 w-4" />;
    case 'achievement_earned':
      return <Award className="h-4 w-4" />;
    default:
      return <ActivityIcon className="h-4 w-4" />;
  }
};

export function ActivityFeed() {
  const { activityLogs, isLoading } = useActivityLogs();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest actions in the community
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (activityLogs.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest actions in the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-muted-foreground">No activity recorded yet. Start participating in the community!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ActivityIcon className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your latest actions in the community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activityLogs.map(log => (
            <div key={log.id} className="flex items-start pb-3 border-b border-border last:border-0 last:pb-0">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-3 flex-shrink-0">
                {getActivityIcon(log.activityType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm">{log.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDate(new Date(log.createdAt))}
                  </span>
                  {log.pointsEarned > 0 && (
                    <span className="text-xs font-medium text-green-500">
                      +{log.pointsEarned} points
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}