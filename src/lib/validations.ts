import { z } from "zod";

export const CreateEmployeeSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  email: z.string().email("Invalid email address"),
  gender: z.enum(["Male", "Female", "Other"]),
  department: z.string().min(1, "Department is required"),
  position: z.string().min(1, "Position is required"),
  country: z.string().min(1, "Country is required"),
  currency: z.string().length(3, "Currency must be a 3-letter ISO code"),
  status: z.enum(["Active", "Inactive"]).default("Active"),
  startDate: z.string().refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  baseSalary: z.number().min(0, "Salary must be non-negative"),
  bonus: z.number().min(0, "Bonus must be non-negative").default(0),
  salaryReason: z.string().optional().default("Initial"),
});

export const UpdateEmployeeSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  gender: z.enum(["Male", "Female", "Other"]).optional(),
  department: z.string().min(1).optional(),
  position: z.string().min(1).optional(),
  country: z.string().min(1).optional(),
  currency: z.string().length(3).optional(),
  status: z.enum(["Active", "Inactive"]).optional(),
  startDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), "Invalid date")
    .optional(),
});

export const AddSalarySchema = z.object({
  baseSalary: z.number().min(0, "Salary must be non-negative"),
  bonus: z.number().min(0, "Bonus must be non-negative").default(0),
  effectiveDate: z
    .string()
    .refine((d) => !isNaN(Date.parse(d)), "Invalid date"),
  reason: z
    .enum(["Annual Review", "Promotion", "Market Adjustment", "Initial", "Other"])
    .optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type CreateEmployeeInput = z.infer<typeof CreateEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof UpdateEmployeeSchema>;
export type AddSalaryInput = z.infer<typeof AddSalarySchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
