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
      stars.push(<Star key={`star-${i}`} className="fill-[#9e7a68] text-[#9e7a68]" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-[#9e7a68] text-[#9e7a68]" />);
    }
    
    // Add empty stars to reach 5
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" />);
    }
    
    return stars;
  };
  
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md flex flex-col h-full hover:shadow-lg transition-all duration-300 border border-neutral-100">
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#9e7a68] bg-opacity-15 flex items-center justify-center text-[#9e7a68] font-medium mr-4 shadow-sm">
          {initials}
        </div>
        <div>
          <h4 className="font-medium text-lg text-gray-800">{name}</h4>
          <p className="text-sm text-gray-500">{memberSince}</p>
        </div>
      </div>
      <p className="text-gray-600 mb-6 flex-grow leading-relaxed">{content}</p>
      <div className="flex text-[#9e7a68] gap-1">
        {renderRating()}
      </div>
    </div>
  );
}
