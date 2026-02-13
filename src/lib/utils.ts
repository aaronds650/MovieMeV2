import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        resolve(func(...args));
      }, wait);
    });
  };
}