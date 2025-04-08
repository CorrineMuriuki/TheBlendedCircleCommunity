import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  initials: string;
  name: string;
  memberSince: string;
  content: string;
  rating: number;
}

export function TestimonialCard({
  initials,
  name,
  memberSince,
  content,
  rating
}: TestimonialCardProps) {
  const renderRating = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-primary text-primary" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-primary text-primary" />);
    }
    
    // Add empty stars to reach 5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" />);
    }
    
    return stars;
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col h-full">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary-dark font-medium mr-3">
          {initials}
        </div>
        <div>
          <h4 className="font-medium">{name}</h4>
          <p className="text-sm text-neutral">{memberSince}</p>
        </div>
      </div>
      <p className="text-neutral-dark mb-4 flex-grow">{content}</p>
      <div className="flex text-primary">
        {renderRating()}
      </div>
    </div>
  );
}
