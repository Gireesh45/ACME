import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Currency formatting
export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

// Format date to readable string
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

// Format date for input fields (YYYY-MM-DD)
export function formatDateInput(date: string | Date): string {
  return new Date(date).toISOString().split("T")[0];
}

// Calculate years of service
export function yearsOfService(startDate: string | Date): number {
  const start = new Date(startDate);
  const now = new Date();
  const diff = now.getFullYear() - start.getFullYear();
  const hasBirthdayPassed =
    now.getMonth() > start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() >= start.getDate());
  return hasBirthdayPassed ? diff : diff - 1;
}

// Parse pagination query params
export function parsePaginationParams(searchParams: URLSearchParams): {
  page: number;
  pageSize: number;
  skip: number;
} {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    100,
    Math.max(1, parseInt(searchParams.get("pageSize") ?? "25", 10))
  );
  return { page, pageSize, skip: (page - 1) * pageSize };
}

// Get latest salary from history
export function getLatestSalary(
  history: { baseSalary: number; bonus: number; effectiveDate: Date | string }[]
): { baseSalary: number; bonus: number; total: number } | null {
  if (!history.length) return null;
  const latest = [...history].sort(
    (a, b) =>
      new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  )[0];
  return {
    baseSalary: latest.baseSalary,
    bonus: latest.bonus,
    total: latest.baseSalary + latest.bonus,
  };
}
