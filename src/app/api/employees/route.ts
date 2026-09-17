import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { CreateEmployeeSchema } from "@/lib/validations";
import { parsePaginationParams } from "@/lib/utils";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const { page, pageSize, skip } = parsePaginationParams(searchParams);

    const search = searchParams.get("search") ?? "";
    const department = searchParams.get("department") ?? "";
    const country = searchParams.get("country") ?? "";
    const status = searchParams.get("status") ?? "";
    const gender = searchParams.get("gender") ?? "";
    const sortBy = searchParams.get("sortBy") ?? "createdAt";
    const sortOrder = (searchParams.get("sortOrder") ?? "desc") as "asc" | "desc";

    // Build where clause
    const where: Prisma.EmployeeWhereInput = {
      ...(search && {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
          { employeeId: { contains: search } },
          { position: { contains: search } },
        ],
      }),
      ...(department && { department }),
      ...(country && { country }),
      ...(status && { status }),
      ...(gender && { gender }),
    };

    // Valid sort fields
    const validSortFields = [
      "firstName", "lastName", "email", "department", "country",
      "status", "startDate", "createdAt", "employeeId",
    ];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [orderByField]: sortOrder },
        include: {
          salaryHistory: {
            orderBy: { effectiveDate: "desc" },
            take: 1, // Only fetch the latest salary record
          },
        },
      }),
      prisma.employee.count({ where }),
    ]);

    // Flatten latest salary
    const data = employees.map((emp) => {
      const latest = emp.salaryHistory[0];
      return {
        ...emp,
        salaryHistory: undefined,
        currentBaseSalary: latest?.baseSalary ?? null,
        currentBonus: latest?.bonus ?? null,
        currentTotal: latest ? latest.baseSalary + latest.bonus : null,
      };
    });

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("[GET /api/employees]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CreateEmployeeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { baseSalary, bonus, salaryReason, ...employeeData } = parsed.data;

    // Generate sequential employee ID
    const count = await prisma.employee.count();
    const employeeId = `EMP-${String(count + 1).padStart(5, "0")}`;

    const employee = await prisma.employee.create({
      data: {
        ...employeeData,
        employeeId,
        startDate: new Date(employeeData.startDate),
        salaryHistory: {
          create: {
            baseSalary,
            bonus,
            effectiveDate: new Date(employeeData.startDate),
            reason: salaryReason ?? "Initial",
          },
        },
      },
      include: {
        salaryHistory: true,
      },
    });

    return NextResponse.json(employee, { status: 201 });
  } catch (error) {
    console.error("[POST /api/employees]", error);
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "An employee with that email already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
