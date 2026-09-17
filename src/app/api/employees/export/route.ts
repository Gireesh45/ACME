import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

const BATCH_SIZE = 500; // Stay well below SQLite's parameter limit

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const department = searchParams.get("department") ?? "";
    const country = searchParams.get("country") ?? "";
    const status = searchParams.get("status") ?? "";

    const where = {
      ...(department && { department }),
      ...(country && { country }),
      ...(status && { status }),
    };

    // CSV headers
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

    const csvLines: string[] = [headers.join(",")];

    // Fetch in batches using cursor pagination to avoid P2029
    let cursor: string | undefined = undefined;
    let hasMore = true;

    while (hasMore) {
      const batch = await prisma.employee.findMany({
        where,
        take: BATCH_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
        orderBy: { id: "asc" },
        include: {
          salaryHistory: {
            orderBy: { effectiveDate: "desc" },
            take: 1,
          },
        },
      });

      if (batch.length === 0) {
        hasMore = false;
        break;
      }

      for (const emp of batch) {
        const latest = emp.salaryHistory[0];
        const row = [
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
        ]
          .map((v) => `"${String(v).replace(/"/g, '""')}"`)
          .join(",");
        csvLines.push(row);
      }

      cursor = batch[batch.length - 1].id;
      hasMore = batch.length === BATCH_SIZE;
    }

    const csv = csvLines.join("\n");

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
