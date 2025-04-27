import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
  }).format(priceInCents);
}

export function getInitials(name: string): string {
  if (!name) return '';

  const parts = name.split(' ');
  if (parts.length === 1) {
    return name.slice(0, 2).toUpperCase();
  }

  return parts.slice(0, 2).map(part => part[0]).join('').toUpperCase();
}