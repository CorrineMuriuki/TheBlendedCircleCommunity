import { useAuth } from "@/hooks/use-auth";
import { Loader2, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Redirect, Link } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";

export default function ProfilePage() {
  const { user, logoutMutation, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getUserSubscriptionBadge = () => {
    switch (user.subscriptionTier) {
      case 'premium':
        return <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">Premium</span>;
      case 'family':
        return <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">Family</span>;
      case 'basic':
        return <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">Basic</span>;
      default:
        return <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full">Free</span>;
    }
  };

  return (
    <div className="container max-w-6xl py-8">
      <div className="flex flex-col items-center p-6 bg-card rounded-lg border border-border text-center max-w-md mx-auto">
        <Avatar className="h-24 w-24 mb-4">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.displayName || user.username} />
          ) : (
            <AvatarFallback className="text-2xl">
              {getInitials(user.displayName || user.username)}
            </AvatarFallback>
          )}
        </Avatar>
        <h2 className="text-xl font-semibold">{user.displayName || user.username}</h2>
        <p className="text-muted-foreground text-sm mb-2">@{user.username}</p>
        <div className="mt-1 mb-4">{getUserSubscriptionBadge()}</div>

        {user.bio && <p className="text-sm">{user.bio}</p>}

        <div className="w-full flex space-x-2 mt-4">
          <Button className="flex-1" variant="outline" asChild>
            <Link to="/profile/edit">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
          <Button className="flex-1" variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4 mr-2" />
            )}
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}