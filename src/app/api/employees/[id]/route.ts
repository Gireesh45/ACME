import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { UpdateEmployeeSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/employees/[id]">
) {
  try {
    const { id } = await ctx.params;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        salaryHistory: {
          orderBy: { effectiveDate: "desc" },
        },
      },
    });

    if (!employee) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error) {
    console.error("[GET /api/employees/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/employees/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const parsed = UpdateEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const updateData = {
      ...parsed.data,
      ...(parsed.data.startDate && { startDate: new Date(parsed.data.startDate) }),
    };

    const employee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        salaryHistory: {
          orderBy: { effectiveDate: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("[PUT /api/employees/[id]]", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/employees/[id]">
) {
  try {
    const { id } = await ctx.params;

    // Soft delete — set status to Inactive
    const employee = await prisma.employee.update({
      where: { id },
      data: { status: "Inactive" },
    });

    return NextResponse.json(employee);
  } catch (error) {
    console.error("[DELETE /api/employees/[id]]", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Employee not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
