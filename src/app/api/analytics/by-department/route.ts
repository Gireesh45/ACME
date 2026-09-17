import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    // Get all employees grouped by department with their latest salary
    const results = await prisma.$queryRaw<
      Array<{
        department: string;
        employeeCount: number;
        avgSalary: number;
        totalPayroll: number;
        minSalary: number;
        maxSalary: number;
      }>
    >`
      SELECT
        e.department,
        COUNT(DISTINCT e.id) as employeeCount,
        AVG(sr.baseSalary) as avgSalary,
        SUM(sr.baseSalary + sr.bonus) as totalPayroll,
        MIN(sr.baseSalary) as minSalary,
        MAX(sr.baseSalary) as maxSalary
      FROM Employee e
      INNER JOIN SalaryRecord sr ON sr.employeeId = e.id
      INNER JOIN (
        SELECT employeeId, MAX(effectiveDate) as maxDate
        FROM SalaryRecord
        GROUP BY employeeId
      ) latest ON sr.employeeId = latest.employeeId AND sr.effectiveDate = latest.maxDate
      WHERE e.status = 'Active'
      GROUP BY e.department
      ORDER BY totalPayroll DESC
    `;

    const data = results.map((r) => ({
      department: r.department,
      employeeCount: Number(r.employeeCount),
      averageSalary: Math.round(Number(r.avgSalary)),
      totalPayroll: Math.round(Number(r.totalPayroll)),
      minSalary: Math.round(Number(r.minSalary)),
      maxSalary: Math.round(Number(r.maxSalary)),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/analytics/by-department]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
