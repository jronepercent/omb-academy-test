"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { Brand } from "./shell";
import { Button } from "./ui/button";
type Mode = "login" | "register" | "forgot-password" | "reset-password";
export function AuthForm({ mode, ready }: { mode: Mode; ready: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const titles = {
    login: "กลับมาเรียนรู้กันต่อ",
    register: "เริ่มต้นเส้นทางของคุณ",
    "forgot-password": "ลืมรหัสผ่าน?",
    "reset-password": "ตั้งรหัสผ่านใหม่",
  };
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setMessage("");
    setSuccess(false);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const db = supabaseBrowser();
    try {
      if (mode === "login") {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else if (mode === "register") {
        const { error, data } = await db.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: String(form.get("full_name")).trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        if (data.session) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setSuccess(true);
          setMessage("ส่งอีเมลยืนยันแล้ว กรุณาตรวจกล่องจดหมายและโฟลเดอร์สแปม");
        }
      } else if (mode === "forgot-password") {
        const { error } = await db.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) throw error;
        setSuccess(true);
        setMessage(
          "หากมีบัญชีนี้ในระบบ คุณจะได้รับลิงก์สำหรับตั้งรหัสผ่านใหม่",
        );
      } else {
        const { error } = await db.auth.updateUser({ password });
        if (error) throw error;
        setSuccess(true);
        setMessage("เปลี่ยนรหัสผ่านแล้ว");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setMessage(
        mode === "login"
          ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง หรือยังไม่ได้ยืนยันอีเมล"
          : "ดำเนินการไม่สำเร็จ กรุณาตรวจข้อมูลหรือลองขอลิงก์ใหม่",
      );
    } finally {
      setBusy(false);
    }
  }
  async function google() {
    setBusy(true);
    setMessage("");
    try {
      const { error } = await supabaseBrowser().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) throw error;
    } catch {
      setMessage("ยังเชื่อมต่อ Google ไม่สำเร็จ กรุณาลองอีกครั้ง");
      setBusy(false);
    }
  }
  return (
    <main className="auth-wrap">
      <div className="auth-box">
        <Link href="/">
          <Brand />
        </Link>
        <div className="panel">
          <p className="eyebrow">YOUR CREATOR SPACE</p>
          <h1>{titles[mode]}</h1>
          <p className="muted small">
            {mode === "login"
              ? "เข้าสู่ระบบเพื่อเรียนต่อจากที่ค้างไว้"
              : "พื้นที่การเรียนรู้สำหรับธุรกิจในแบบของคุณ"}
          </p>
          {!ready && (
            <div className="notice">
              ยังไม่ได้เชื่อมระบบบัญชีจริง
              <br />
              <Link className="text-link" href="/demo">
                  ดูตัวอย่างคอร์ส →
              </Link>
            </div>
          )}
          <form onSubmit={submit} className="form-grid">
            {mode === "register" && (
              <label>
                ชื่อของคุณ
                <input
                  name="full_name"
                  autoComplete="name"
                  maxLength={100}
                  required
                />
              </label>
            )}
            {mode !== "reset-password" && (
              <label>
                อีเมล
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                />
              </label>
            )}
            {mode !== "forgot-password" && (
              <label>
                รหัสผ่าน
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  maxLength={128}
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  required
                  placeholder="อย่างน้อย 8 ตัวอักษร"
                />
              </label>
            )}
            {message && (
              <div
                role="status"
                className={`notice ${success ? "success" : "error"}`}
              >
                {message}
              </div>
            )}
            <Button disabled={!ready || busy} type="submit" className="full">
              {busy
                ? "กำลังดำเนินการ..."
                : {
                    login: "เข้าสู่ระบบ",
                    register: "สร้างบัญชี",
                    "forgot-password": "ส่งลิงก์ตั้งรหัสผ่าน",
                    "reset-password": "บันทึกรหัสผ่านใหม่",
                  }[mode]}
            </Button>
          </form>
          {(mode === "login" || mode === "register") && (
            <>
              <div className="or">หรือ</div>
              <Button
                variant="secondary"
                className="full"
                disabled={!ready || busy}
                onClick={google}
              >
                ดำเนินการต่อด้วย Google
              </Button>
            </>
          )}
          <div className="auth-links">
            <Link href={mode === "login" ? "/register" : "/login"}>
              {mode === "login"
                ? "ยังไม่มีบัญชี? สมัครสมาชิก"
                : "กลับไปเข้าสู่ระบบ"}
            </Link>
            {mode === "login" && (
              <Link href="/forgot-password">ลืมรหัสผ่าน</Link>
            )}
          </div>
        </div>
        <p
          className="small muted"
          style={{ marginTop: 20, textAlign: "center" }}
        >
          OMB ACADEMY · เรียนรู้ในจังหวะของคุณ
        </p>
      </div>
    </main>
  );
}
