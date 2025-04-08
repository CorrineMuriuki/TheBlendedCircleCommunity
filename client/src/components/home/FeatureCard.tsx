import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-lg bg-neutral-lightest transition-transform hover:-translate-y-1 hover:shadow-md">
      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4">
        <span className="material-icons text-white">{icon}</span>
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-neutral-dark">{description}</p>
    </div>
  );
}
