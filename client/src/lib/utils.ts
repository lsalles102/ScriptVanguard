import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price from cents to dollars
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// Generate random initials from a string (e.g., email or username)
export function getInitials(name: string): string {
  if (!name) return "U";
  
  // If it's an email, get the part before the @ symbol
  const cleanName = name.includes('@') ? name.split('@')[0] : name;
  
  // If name has multiple parts (separated by space, dot, underscore, etc.)
  // Get the first character of each part
  const parts = cleanName.split(/[\s._-]+/);
  if (parts.length > 1) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  
  // Otherwise, return the first character
  return cleanName[0].toUpperCase();
}

// Format date to a readable string
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  
  // If invalid date, return empty string
  if (isNaN(date.getTime())) return "";
  
  // Format: "Month Day, Year"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Calculate time elapsed since a date (e.g., "2 days ago")
export function timeAgo(dateString: string): string {
  const date = new Date(dateString);
  
  // If invalid date, return empty string
  if (isNaN(date.getTime())) return "";
  
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval === 1 ? "1 year ago" : `${interval} years ago`;
  }
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval === 1 ? "1 month ago" : `${interval} months ago`;
  }
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval === 1 ? "1 day ago" : `${interval} days ago`;
  }
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval === 1 ? "1 hour ago" : `${interval} hours ago`;
  }
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval === 1 ? "1 minute ago" : `${interval} minutes ago`;
  }
  
  return "just now";
}

// Generate HWID mock for demo purposes - in a real app this would be calculated from hardware
export function generateHWID(): string {
  const randomBytes = new Uint8Array(16);
  window.crypto.getRandomValues(randomBytes);
  
  // Convert to hexadecimal string
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

// Extract username from email or generate a username based on a string
export function generateUsername(input: string): string {
  if (!input) return "user";
  
  // If it's an email, get the part before the @ symbol
  if (input.includes('@')) {
    return input.split('@')[0];
  }
  
  // Remove special characters and spaces
  return input.replace(/[^a-zA-Z0-9]/g, '');
}

// Truncate text to a specified length
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Generate CSS gradient values for cyberpunk theme
export function cyberpunkGradient(color1 = "#00f0ff", color2 = "#7000ff"): string {
  return `linear-gradient(90deg, ${color1} 0%, ${color2} 100%)`;
}
