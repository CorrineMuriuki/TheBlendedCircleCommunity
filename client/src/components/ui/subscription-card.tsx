import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SubscriptionCardProps {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  disabledFeatures?: string[];
  isPopular?: boolean;
  isPrimary?: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function SubscriptionCard({
  name,
  price,
  period = "/month",
  description,
  features,
  disabledFeatures = [],
  isPopular = false,
  isPrimary = false,
  onClick,
  disabled = false,
}: SubscriptionCardProps) {
  return (
    <div 
      className={cn(
        "border rounded-lg p-6 flex flex-col hover:shadow-md transition-shadow relative",
        isPrimary ? "border-2 border-primary shadow-md" : "border-neutral-light",
      )}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 bg-primary text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
          MOST POPULAR
        </div>
      )}

      <h3 className="text-xl font-medium mb-2">{name}</h3>
      <div className="text-2xl font-semibold mb-1">
        {price}
        <span className="text-sm font-normal text-neutral">{period}</span>
      </div>
      <p className="text-sm text-neutral mb-6">{description}</p>
      
      <ul className="space-y-3 mb-6 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
        
        {disabledFeatures.map((feature, index) => (
          <li key={index} className="flex items-start text-neutral">
            <X className="h-5 w-5 mr-2 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      
      <Button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "mt-auto w-full rounded-full transition-colors",
          isPrimary 
            ? "bg-primary hover:bg-primary-dark text-white" 
            : "border border-primary text-primary hover:bg-primary hover:text-white"
        )}
      >
        Select Plan
      </Button>
    </div>
  );
}
