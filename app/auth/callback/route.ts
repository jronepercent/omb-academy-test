import { NextResponse } from "next/server";
import { supabaseServer, configured } from "@/lib/supabase/server";
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL || url.origin;
  const code = url.searchParams.get("code");
  const next =
    url.searchParams.get("next") === "/reset-password"
      ? "/reset-password"
      : "/dashboard";
  if (code && configured()) {
    const db = await supabaseServer();
    const { error } = await db.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL("/login?error=callback", origin));
}
