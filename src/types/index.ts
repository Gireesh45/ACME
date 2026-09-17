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
  status: "Active" | "Inactive";
  startDate: string;
  createdAt: string;
  updatedAt: string;
  salaryHistory?: SalaryRecord[];
}

export interface SalaryRecord {
  id: string;
  employeeId: string;
  baseSalary: number;
  bonus: number;
  effectiveDate: string;
  reason?: string | null;
  createdAt: string;
}

export interface EmployeeWithLatestSalary extends Employee {
  currentBaseSalary?: number;
  currentBonus?: number;
  currentTotal?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  country?: string;
  status?: string;
  gender?: string;
}

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
