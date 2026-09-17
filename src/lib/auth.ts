import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me"
);

const COOKIE_NAME = "salary_mgr_session";
const EXPIRES_IN = "24h";

// Hardcoded admin credentials for demo purposes
export const ADMIN_CREDENTIALS = {
  email: "admin@acme.com",
  password: "admin",
  name: "HR Admin",
  role: "admin",
} as const;

export interface SessionPayload extends JWTPayload {
  email: string;
  name: string;
  role: string;
}

export async function signToken(payload: Omit<SessionPayload, keyof JWTPayload>): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function createSession(payload: Omit<SessionPayload, keyof JWTPayload>): Promise<string> {
  return signToken(payload);
}

export function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get(COOKIE_NAME)?.value ?? null;
}

export { COOKIE_NAME };
