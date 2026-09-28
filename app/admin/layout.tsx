import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { Shell } from "@/components/shell";
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireUser(true);
  return (
    <Shell name={profile.full_name} admin active="admin">
      <main className="page">
        <p className="eyebrow">ADMIN WORKSPACE</p>
        <div className="admin-nav">
          <Link className="button secondary" href="/admin">
            ภาพรวม
          </Link>
          <Link className="button secondary" href="/admin/courses">
            คอร์ส
          </Link>
          <Link className="button secondary" href="/admin/users">
            ผู้เรียน
          </Link>
        </div>
        {children}
      </main>
    </Shell>
  );
}
