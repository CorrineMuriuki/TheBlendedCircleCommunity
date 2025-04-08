import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  username: string;
  timestamp: string;
  isCurrentUser: boolean;
  initials: string;
  isModerator?: boolean;
}

export function MessageBubble({
  content,
  username,
  timestamp,
  isCurrentUser,
  initials,
  isModerator = false
}: MessageBubbleProps) {
  const formattedTime = formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  
  return (
    <div className={cn(
      "flex items-start gap-3",
      isCurrentUser && "flex-row-reverse"
    )}>
      <Avatar className={cn(
        "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-medium",
        isCurrentUser ? "bg-primary text-white" : "bg-primary-light text-primary-dark"
      )}>
        <AvatarFallback>
          {initials}
        </AvatarFallback>
      </Avatar>
      
      <div className={cn(isCurrentUser && "text-right")}>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            "font-medium",
            isCurrentUser && "order-2"
          )}>
            {username}
          </span>
          <span className="text-xs text-neutral">
            {formattedTime}
          </span>
          {isModerator && (
            <span className="text-xs px-2 py-0.5 bg-primary-light text-primary-dark rounded-full">
              Moderator
            </span>
          )}
        </div>
        
        <div className={cn(
          "mt-1 p-3 rounded-lg",
          isCurrentUser 
            ? "bg-primary text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg" 
            : "bg-neutral-lightest rounded-tl-lg rounded-tr-lg rounded-br-lg"
        )}>
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
}
