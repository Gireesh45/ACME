import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const department = searchParams.get("department") ?? "";
    const country = searchParams.get("country") ?? "";
    const status = searchParams.get("status") ?? "";

    const employees = await prisma.employee.findMany({
      where: {
        ...(department && { department }),
        ...(country && { country }),
        ...(status && { status }),
      },
      include: {
        salaryHistory: {
          orderBy: { effectiveDate: "desc" },
          take: 1,
        },
      },
      orderBy: { employeeId: "asc" },
    });

    // Build CSV
    const headers = [
      "Employee ID",
      "First Name",
      "Last Name",
      "Email",
      "Gender",
      "Department",
      "Position",
      "Country",
      "Currency",
      "Base Salary",
      "Bonus",
      "Total Compensation",
      "Status",
      "Start Date",
    ];

    const rows = employees.map((emp) => {
      const latest = emp.salaryHistory[0];
      return [
        emp.employeeId,
        emp.firstName,
        emp.lastName,
        emp.email,
        emp.gender,
        emp.department,
        emp.position,
        emp.country,
        emp.currency,
        latest?.baseSalary ?? "",
        latest?.bonus ?? "",
        latest ? latest.baseSalary + latest.bonus : "",
        emp.status,
        formatDate(emp.startDate),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="acme-employees-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("[GET /api/employees/export]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
