import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}

const COOKIE_NAME = "admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24; // 24 horas

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET nao configurado");
  return secret;
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function validatePassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !password) return false;
  return safeEqual(password, expected);
}

export async function setAdminSession() {
  const expires = String(Date.now() + SESSION_MAX_AGE * 1000);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, `${expires}.${sign(expires)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return false;

  const [expires, signature] = value.split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;

  try {
    return safeEqual(signature, sign(expires));
  } catch {
    return false;
  }
}
