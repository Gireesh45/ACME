import { NextRequest, NextResponse } from "next/server";
import { ADMIN_CREDENTIALS, COOKIE_NAME, signToken } from "@/lib/auth";
import { LoginSchema } from "@/lib/validations";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Simple hardcoded auth check
    if (
      email !== ADMIN_CREDENTIALS.email ||
      password !== ADMIN_CREDENTIALS.password
    ) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = await signToken({
      email: ADMIN_CREDENTIALS.email,
      name: ADMIN_CREDENTIALS.name,
      role: ADMIN_CREDENTIALS.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        email: ADMIN_CREDENTIALS.email,
        name: ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
