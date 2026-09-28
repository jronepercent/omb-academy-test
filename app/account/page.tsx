import { requireUser } from "@/lib/auth";
import { Shell } from "@/components/shell";
import { AccountForm } from "@/components/account-form";
import Link from "next/link";
export default async function Account() {
  const { profile } = await requireUser();
  return (
    <Shell
      name={profile.full_name}
      admin={profile.role === "admin"}
      active="account"
    >
      <main className="page">
        <p className="eyebrow">ACCOUNT SETTINGS</p>
        <h1>บัญชีของฉัน</h1>
        <p className="muted">จัดการข้อมูลส่วนตัวของคุณ</p>
        <AccountForm name={profile.full_name} email={profile.email} />
        <Link className="text-link" href="/forgot-password">
          ขอลิงก์เปลี่ยนรหัสผ่าน →
        </Link>
      </main>
    </Shell>
  );
}
