import "server-only";
import { redirect } from "next/navigation";
import { configured, supabaseServer } from "./supabase/server";
import type { Profile } from "./types";
export async function requireUser(admin = false) {
  if (!configured()) redirect("/login?setup=1");
  const db = await supabaseServer();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile, error } = await db
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error || !profile)
    throw new Error("ไม่สามารถโหลดบัญชีได้ กรุณาลองอีกครั้ง");
  if (admin && profile.role !== "admin") redirect("/dashboard");
  return { db, user, profile: profile as Profile };
}
