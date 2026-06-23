"use server";

import { redirect } from "next/navigation";
import { setAdminSession, clearAdminSession, validateCredentials } from "@/lib/auth";

export async function signInAdmin(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  if (!validateCredentials(email, password)) {
    redirect("/admin/login?error=invalid");
  }

  await setAdminSession();
  redirect("/admin");
}

export async function signOutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}
