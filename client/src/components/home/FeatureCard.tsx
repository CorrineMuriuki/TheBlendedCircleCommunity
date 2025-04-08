import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 sm:p-8 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-neutral-100">
      <div className="w-16 h-16 sm:w-18 sm:h-18 bg-[#9e7a68] rounded-full flex items-center justify-center mb-6 shadow-md mx-auto sm:mx-0">
        <span className="material-icons text-white text-2xl sm:text-3xl">{icon}</span>
      </div>
      <h3 className="text-lg sm:text-xl font-medium mb-3 text-[#9e7a68] text-center sm:text-left">{title}</h3>
      <p className="text-gray-600 text-sm sm:text-base leading-relaxed text-center sm:text-left">{description}</p>
    </div>
  );
}
