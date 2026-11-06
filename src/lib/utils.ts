import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Rounds to one decimal and drops float noise: 5.000000000000001 → 5, 5.749 → 5.7.
 * Every nutrition number shown in the app goes through this.
 */
export function round1(n: number) {
  return Math.round(n * 10) / 10;
}
