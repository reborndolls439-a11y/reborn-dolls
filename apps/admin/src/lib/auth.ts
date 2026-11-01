import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@reborn/db";
import bcrypt from "bcryptjs";
import type { User } from "@reborn/types";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-dev-secret-change-in-production");
const COOKIE_NAME = "reborn_admin_session";

export async function signToken(payload: { userId: string; role: string }) {
  return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(JWT_SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; role: string };
  } catch { return null; }
}

export async function setAdminSession(token: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 60 * 60 * 24 * 7, path: "/" });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getAdminSession(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function getCurrentAdmin(): Promise<User | null> {
  const token = await getAdminSession();
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, name: true, role: true, emailVerified: true, avatar: true, createdAt: true, updatedAt: true, isActive: true },
  });
  if (!user || !user.isActive || (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN")) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role as User["role"], emailVerified: user.emailVerified, avatar: user.avatar, createdAt: user.createdAt, updatedAt: user.updatedAt };
}

export async function verifyPassword(plain: string, hash: string) { return bcrypt.compare(plain, hash); }
