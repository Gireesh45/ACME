import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    // 1. Get all salary records to compute payroll stats
    const [
      totalEmployees,
      activeEmployees,
      departmentCount,
      countryCount,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: "Active" } }),
      prisma.employee.groupBy({ by: ["department"] }).then((r) => r.length),
      prisma.employee.groupBy({ by: ["country"] }).then((r) => r.length),
    ]);

    // Get latest salary for each active employee
    const latestSalaries = await prisma.$queryRaw<
      Array<{ baseSalary: number; bonus: number }>
    >`
      SELECT sr.baseSalary, sr.bonus
      FROM SalaryRecord sr
      INNER JOIN (
        SELECT employeeId, MAX(effectiveDate) as maxDate
        FROM SalaryRecord
        GROUP BY employeeId
      ) latest ON sr.employeeId = latest.employeeId AND sr.effectiveDate = latest.maxDate
      INNER JOIN Employee e ON sr.employeeId = e.id
      WHERE e.status = 'Active'
    `;

    const totalPayroll = latestSalaries.reduce(
      (sum, s) => sum + Number(s.baseSalary) + Number(s.bonus),
      0
    );
    const averageSalary =
      latestSalaries.length > 0 ? totalPayroll / latestSalaries.length : 0;

    return NextResponse.json({
      totalEmployees,
      activeEmployees,
      totalPayroll: Math.round(totalPayroll),
      averageSalary: Math.round(averageSalary),
      departmentCount,
      countryCount,
    });
  } catch (error) {
    console.error("[GET /api/analytics/summary]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
