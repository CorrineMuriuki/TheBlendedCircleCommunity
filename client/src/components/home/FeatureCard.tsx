import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-8 rounded-xl bg-[#2C1810] border border-[#3D2316] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#5A3A2A]">
      <div className="w-14 h-14 bg-[#3D2316]/50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#5A3A2A]/50 transition-colors duration-300">
        <span className="material-icons text-[#D4B5A0] text-xl">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-[#F5E6D9]">{title}</h3>
      <p className="text-[#D4B5A0] leading-relaxed">{description}</p>
    </div>
  );
}