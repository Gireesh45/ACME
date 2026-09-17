import { describe, it, expect } from "vitest";
import { CreateEmployeeSchema, UpdateEmployeeSchema, AddSalarySchema, LoginSchema } from "@/lib/validations";

describe("CreateEmployeeSchema", () => {
  const valid = {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane.doe@acme.com",
    gender: "Female" as const,
    department: "Engineering",
    position: "Software Engineer II",
    country: "United States",
    currency: "USD",
    status: "Active" as const,
    startDate: "2023-01-15",
    baseSalary: 90000,
    bonus: 10000,
    salaryReason: "Initial",
  };

  it("validates a correct employee", () => {
    const result = CreateEmployeeSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects missing firstName", () => {
    const result = CreateEmployeeSchema.safeParse({ ...valid, firstName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email", () => {
    const result = CreateEmployeeSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid gender", () => {
    const result = CreateEmployeeSchema.safeParse({ ...valid, gender: "Unknown" });
    expect(result.success).toBe(false);
  });

  it("rejects negative salary", () => {
    const result = CreateEmployeeSchema.safeParse({ ...valid, baseSalary: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects currency longer than 3 chars", () => {
    const result = CreateEmployeeSchema.safeParse({ ...valid, currency: "DOLLAR" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid date", () => {
    const result = CreateEmployeeSchema.safeParse({ ...valid, startDate: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("defaults bonus to 0 when not provided", () => {
    const { bonus, ...withoutBonus } = valid;
    const result = CreateEmployeeSchema.safeParse(withoutBonus);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.bonus).toBe(0);
    }
  });

  it("defaults status to Active when not provided", () => {
    const { status, ...withoutStatus } = valid;
    const result = CreateEmployeeSchema.safeParse(withoutStatus);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("Active");
    }
  });
});

describe("AddSalarySchema", () => {
  const valid = {
    baseSalary: 85000,
    bonus: 5000,
    effectiveDate: "2024-01-01",
    reason: "Annual Review" as const,
  };

  it("validates a correct salary record", () => {
    const result = AddSalarySchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects negative baseSalary", () => {
    const result = AddSalarySchema.safeParse({ ...valid, baseSalary: -100 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid effectiveDate", () => {
    const result = AddSalarySchema.safeParse({ ...valid, effectiveDate: "tomorrow" });
    expect(result.success).toBe(false);
  });

  it("allows zero bonus", () => {
    const result = AddSalarySchema.safeParse({ ...valid, bonus: 0 });
    expect(result.success).toBe(true);
  });
});

describe("LoginSchema", () => {
  it("validates correct credentials", () => {
    const result = LoginSchema.safeParse({ email: "admin@acme.com", password: "admin" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = LoginSchema.safeParse({ email: "not-email", password: "admin" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = LoginSchema.safeParse({ email: "admin@acme.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("UpdateEmployeeSchema", () => {
  it("allows partial updates", () => {
    const result = UpdateEmployeeSchema.safeParse({ department: "Design" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = UpdateEmployeeSchema.safeParse({ status: "Pending" });
    expect(result.success).toBe(false);
  });

  it("allows empty object (no-op update)", () => {
    const result = UpdateEmployeeSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});
