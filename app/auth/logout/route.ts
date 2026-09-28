import { NextResponse } from "next/server";
import { configured, supabaseServer } from "@/lib/supabase/server";
export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") !== origin)
    return new Response("Forbidden", { status: 403 });
  if (configured()) {
    const db = await supabaseServer();
    await db.auth.signOut();
  }
  return NextResponse.redirect(new URL("/login", origin), 303);
}
