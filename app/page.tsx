import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { redirect } from "next/navigation";
import { Brand } from "@/components/shell";
import { configured, supabaseServer } from "@/lib/supabase/server";
export default async function Home() {
  if (configured()) {
    const db = await supabaseServer();
    const {
      data: { user },
    } = await db.auth.getUser();
    if (user) redirect("/dashboard");
  }
  return (
    <div className="landing">
      <header>
        <Brand />
        <Link className="button secondary" href="/login">
          เข้าสู่ระบบ
          <ArrowRight size={16} />
        </Link>
      </header>
      <main>
        <p className="eyebrow">A SPACE FOR INDEPENDENT CREATORS</p>
        <h1>
          เรียนรู้. สร้าง.
          <br />
          <span>ลงมือทำ.</span>
        </h1>
        <p className="muted">
          เปลี่ยนความรู้ให้เป็นธุรกิจในแบบของคุณ
          <br />
          ทุกคอร์ส ทุกบทเรียน ทุกก้าวต่อไป อยู่ในที่เดียว
        </p>
        <div className="landing-actions">
          <Link className="button primary" href="/login">
            เข้าสู่พื้นที่การเรียนรู้
            <ArrowRight size={18} />
          </Link>
          <Link className="button secondary" href="/demo">
            <Play size={16} />
              ดูตัวอย่างคอร์ส
          </Link>
        </div>
        <div className="landing-bottom">
          <span>ONE MAN BUSINESS</span>
          <span>YOUR KNOWLEDGE. YOUR BUSINESS.</span>
        </div>
      </main>
      <footer>OMB ACADEMY · LEARN. BUILD. GROW.</footer>
    </div>
  );
}
