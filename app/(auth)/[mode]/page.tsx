import { AuthForm } from "@/components/auth-form";
import { configured } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
export default async function AuthPage({
  params,
}: {
  params: Promise<{ mode: string }>;
}) {
  const { mode } = await params;
  if (
    mode !== "login" &&
    mode !== "register" &&
    mode !== "forgot-password" &&
    mode !== "reset-password"
  )
    notFound();
  return <AuthForm mode={mode} ready={configured()} />;
}
