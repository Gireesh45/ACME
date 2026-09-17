import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const results = await prisma.$queryRaw<
      Array<{
        country: string;
        currency: string;
        employeeCount: number;
        avgSalary: number;
        totalPayroll: number;
      }>
    >`
      SELECT
        e.country,
        e.currency,
        COUNT(DISTINCT e.id) as employeeCount,
        AVG(sr.baseSalary) as avgSalary,
        SUM(sr.baseSalary + sr.bonus) as totalPayroll
      FROM Employee e
      INNER JOIN SalaryRecord sr ON sr.employeeId = e.id
      INNER JOIN (
        SELECT employeeId, MAX(effectiveDate) as maxDate
        FROM SalaryRecord
        GROUP BY employeeId
      ) latest ON sr.employeeId = latest.employeeId AND sr.effectiveDate = latest.maxDate
      WHERE e.status = 'Active'
      GROUP BY e.country, e.currency
      ORDER BY employeeCount DESC
    `;

    const data = results.map((r) => ({
      country: r.country,
      currency: r.currency,
      employeeCount: Number(r.employeeCount),
      averageSalary: Math.round(Number(r.avgSalary)),
      totalPayroll: Math.round(Number(r.totalPayroll)),
    }));

    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /api/analytics/by-country]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
