import { Toaster as Sonner } from 'sonner';
import { toast as sonnerToast } from 'sonner';

export function Toaster() {
  return (
    <Sonner
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }}
    />
  );
}

export function toast({
  title,
  description,
  variant = 'default',
}: {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}) {
  sonnerToast(title, {
    description,
    className: variant === 'destructive' ? 'bg-destructive text-destructive-foreground' : '',
  });
}
