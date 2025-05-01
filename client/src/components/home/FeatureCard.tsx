import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group p-8 rounded-xl bg-white border border-neutral-light transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20">
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
        <span className="material-icons text-primary text-2xl">{icon}</span>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-neutral-darkest">{title}</h3>
      <p className="text-neutral-dark leading-relaxed">{description}</p>
    </div>
  );
}
