import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-8 rounded-xl bg-white border-2 border-[#9e7a68]/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#9e7a68]/40">
      <div className="w-16 h-16 bg-[#9e7a68]/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#9e7a68]/20 transition-colors duration-300">
        <span className="material-icons text-[#9e7a68] text-2xl">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-[#9e7a68] font-montserrat">{title}</h3>
      <p className="text-gray-600 leading-relaxed font-montserrat">{description}</p>
    </div>
  );
}