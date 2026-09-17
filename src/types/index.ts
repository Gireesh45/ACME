// Domain types

export interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  department: string;
  position: string;
  country: string;
  currency: string;
  status: string;
  startDate: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  baseSalary: number;
  bonus: number;
  effectiveDate: string | Date;
  reason?: string | null;
  createdAt: string | Date;
}

export interface EmployeeWithLatestSalary extends Employee {
  currentBaseSalary: number | null;
  currentBonus: number | null;
  currentTotal: number | null;
}

// API responses

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Analytics types

export interface AnalyticsSummary {
  totalEmployees: number;
  activeEmployees: number;
  totalPayroll: number;
  averageSalary: number;
  departmentCount: number;
  countryCount: number;
}

export interface DepartmentAnalytics {
  department: string;
  employeeCount: number;
  averageSalary: number;
  totalPayroll: number;
  minSalary: number;
  maxSalary: number;
}

export interface CountryAnalytics {
  country: string;
  currency: string;
  employeeCount: number;
  averageSalary: number;
  totalPayroll: number;
}
