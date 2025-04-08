import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 sm:p-8 rounded-lg bg-neutral-lightest shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#9e7a68] rounded-full flex items-center justify-center mb-5 shadow-sm">
        <span className="material-icons text-white text-2xl sm:text-3xl">{icon}</span>
      </div>
      <h3 className="text-xl sm:text-2xl font-medium mb-3 text-[#9e7a68]">{title}</h3>
      <p className="text-gray-600 text-base sm:text-lg leading-relaxed">{description}</p>
    </div>
  );
}
