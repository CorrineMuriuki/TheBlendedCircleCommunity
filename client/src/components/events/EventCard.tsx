import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCardProps {
  id: number;
  title: string;
  description: string;
  imageUrl: string;
  startDate: string;
  eventType: string;
  attendeeCount: number;
  onRsvp: (eventId: number) => void;
  isAttending?: boolean;
  isLoading?: boolean;
}

export function EventCard({
  id,
  title,
  description,
  imageUrl,
  startDate,
  eventType,
  attendeeCount,
  onRsvp,
  isAttending = false,
  isLoading = false
}: EventCardProps) {
  const formattedDate = formatDate(new Date(startDate));
  const eventTypeLabel = eventType.toUpperCase();
  
  // Get badge color based on event type
  const getBadgeVariant = () => {
    switch(eventType.toLowerCase()) {
      case 'workshop':
        return "default";
      case 'social':
        return "secondary";
      case 'live':
        return "destructive";
      default:
        return "outline";
    }
  };
  
  return (
    <div className="bg-neutral-lightest rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-primary-light">
        <img 
          src={imageUrl} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <Badge 
          variant={getBadgeVariant()} 
          className="absolute top-4 right-4"
        >
          {eventTypeLabel}
        </Badge>
      </div>
      
      <div className="p-4">
        <div className="flex items-center text-sm text-neutral mb-2">
          <Calendar size={16} className="mr-1" />
          <span>{formattedDate}</span>
        </div>
        
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        <p className="text-neutral-dark text-sm mb-4 line-clamp-3">{description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-neutral">{attendeeCount} attending</span>
          <Button
            onClick={() => onRsvp(id)}
            disabled={isAttending || isLoading}
            className={cn(
              "bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm transition-colors",
              isAttending && "bg-green-600 hover:bg-green-700"
            )}
          >
            {isAttending ? "Attending" : "RSVP"}
          </Button>
        </div>
      </div>
    </div>
  );
}
