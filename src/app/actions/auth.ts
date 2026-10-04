"use server";

import { redirect } from "next/navigation";
import { setAdminSession, clearAdminSession, validatePassword } from "@/lib/auth";

export async function signInAdmin(formData: FormData) {
  const password = String(formData.get("password") || "");

  if (!validatePassword(password)) {
    redirect("/admin/login?error=invalid");
  }

  await setAdminSession();
  redirect("/admin");
}

export async function signOutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
