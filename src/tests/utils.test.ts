import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  parsePaginationParams,
  getLatestSalary,
  yearsOfService,
} from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats USD correctly", () => {
    expect(formatCurrency(75000, "USD")).toBe("$75,000");
  });

  it("formats INR correctly", () => {
    const result = formatCurrency(1500000, "INR");
    expect(result).toContain("1,500,000");
  });

  it("formats GBP correctly", () => {
    const result = formatCurrency(60000, "GBP");
    expect(result).toContain("60,000");
  });

  it("falls back gracefully for unknown currency", () => {
    // XYZ is not a valid ISO currency but should not throw
    const result = formatCurrency(50000, "XYZ");
    expect(result).toContain("50");
  });

  it("handles zero amount", () => {
    expect(formatCurrency(0, "USD")).toBe("$0");
  });

  it("handles large amounts", () => {
    const result = formatCurrency(1_000_000, "USD");
    expect(result).toContain("1,000,000");
  });
});

describe("formatDate", () => {
  it("formats a date string", () => {
    const result = formatDate("2023-01-15");
    expect(result).toContain("2023");
    expect(result).toContain("Jan");
  });

  it("formats a Date object", () => {
    const date = new Date("2022-06-01");
    const result = formatDate(date);
    expect(result).toContain("2022");
  });

  it("formats dates consistently", () => {
    // Same date always gives same result
    expect(formatDate("2024-03-15")).toBe(formatDate("2024-03-15"));
  });
});

describe("parsePaginationParams", () => {
  it("returns defaults when no params", () => {
    const params = new URLSearchParams();
    const result = parsePaginationParams(params);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(25);
    expect(result.skip).toBe(0);
  });

  it("correctly computes skip", () => {
    const params = new URLSearchParams({ page: "3", pageSize: "10" });
    const result = parsePaginationParams(params);
    expect(result.page).toBe(3);
    expect(result.pageSize).toBe(10);
    expect(result.skip).toBe(20);
  });

  it("enforces minimum page of 1", () => {
    const params = new URLSearchParams({ page: "-5" });
    const result = parsePaginationParams(params);
    expect(result.page).toBe(1);
  });

  it("enforces maximum pageSize of 100", () => {
    const params = new URLSearchParams({ pageSize: "9999" });
    const result = parsePaginationParams(params);
    expect(result.pageSize).toBe(100);
  });

  it("enforces minimum pageSize of 1", () => {
    const params = new URLSearchParams({ pageSize: "0" });
    const result = parsePaginationParams(params);
    expect(result.pageSize).toBe(1);
  });

  it("handles non-numeric page gracefully", () => {
    const params = new URLSearchParams({ page: "abc" });
    const result = parsePaginationParams(params);
    expect(result.page).toBe(1);
  });
});

describe("getLatestSalary", () => {
  it("returns null for empty history", () => {
    expect(getLatestSalary([])).toBeNull();
  });

  it("returns the most recent salary record", () => {
    const history = [
      { baseSalary: 70000, bonus: 5000, effectiveDate: "2022-01-01" },
      { baseSalary: 80000, bonus: 8000, effectiveDate: "2023-06-01" },
      { baseSalary: 75000, bonus: 6000, effectiveDate: "2022-07-01" },
    ];
    const result = getLatestSalary(history);
    expect(result?.baseSalary).toBe(80000);
    expect(result?.bonus).toBe(8000);
    expect(result?.total).toBe(88000);
  });

  it("correctly computes total as baseSalary + bonus", () => {
    const history = [{ baseSalary: 100000, bonus: 20000, effectiveDate: "2024-01-01" }];
    const result = getLatestSalary(history);
    expect(result?.total).toBe(120000);
  });

  it("handles single record", () => {
    const history = [{ baseSalary: 60000, bonus: 0, effectiveDate: "2023-01-01" }];
    const result = getLatestSalary(history);
    expect(result?.baseSalary).toBe(60000);
    expect(result?.total).toBe(60000);
  });
});

describe("yearsOfService", () => {
  it("returns 0 for a recent start date", () => {
    const today = new Date();
    const result = yearsOfService(today.toISOString());
    expect(result).toBe(0);
  });

  it("returns positive years for past dates", () => {
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    const result = yearsOfService(fiveYearsAgo.toISOString());
    expect(result).toBeGreaterThanOrEqual(4);
    expect(result).toBeLessThanOrEqual(5);
  });
});
