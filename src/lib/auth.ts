import { cookies } from "next/headers";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@store.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

export async function setAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set("admin_session", "true", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  return session?.value === "true";
}

export function validateCredentials(email: string, password: string): boolean {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
}
