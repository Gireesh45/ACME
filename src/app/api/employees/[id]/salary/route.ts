import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AddSalarySchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

// GET salary history for an employee
export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/employees/[id]/salary">
) {
  try {
    const { id } = await ctx.params;

    const records = await prisma.salaryRecord.findMany({
      where: { employeeId: id },
      orderBy: { effectiveDate: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("[GET /api/employees/[id]/salary]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST to add a new salary record (audit trail)
export async function POST(
  req: NextRequest,
  ctx: RouteContext<"/api/employees/[id]/salary">
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = AddSalarySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify employee exists
    const employee = await prisma.employee.findUnique({ where: { id } });
    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    const record = await prisma.salaryRecord.create({
      data: {
        employeeId: id,
        baseSalary: parsed.data.baseSalary,
        bonus: parsed.data.bonus,
        effectiveDate: new Date(parsed.data.effectiveDate),
        reason: parsed.data.reason ?? "Other",
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("[POST /api/employees/[id]/salary]", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
