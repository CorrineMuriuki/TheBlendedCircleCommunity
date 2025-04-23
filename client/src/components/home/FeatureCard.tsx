import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 sm:p-8 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-neutral-100">
      <div className="h-14 w-14 sm:h-16 sm:w-16 bg-[#9e7a68] rounded-full flex items-center justify-center mb-5 shadow-md mx-auto sm:mx-0">
        <span className="material-icons text-white text-xl sm:text-2xl">{icon}</span>
      </div>
      <h3 className="text-base sm:text-base font-medium mb-3 text-[#9e7a68] text-center sm:text-left">{title}</h3>
      <p className="text-gray-700 text-sm sm:text-sm leading-relaxed text-center sm:text-left">{description}</p>
    </div>
  );
}