import { requireUser } from "@/lib/auth";
import Link from "next/link";
export default async function Admin() {
  const { db } = await requireUser(true);
  const counts = await Promise.all(
    ["courses", "profiles", "enrollments"].map((table) =>
      db.from(table).select("*", { head: true, count: "exact" }),
    ),
  );
  if (counts.some((c) => c.error)) throw new Error("โหลดข้อมูลไม่สำเร็จ");
  return (
    <>
      <h1>ภาพรวม Academy</h1>
      <p className="muted">จัดการคอร์ส เนื้อหา และสิทธิ์ของผู้เรียน</p>
      <div className="stats">
        {["คอร์สทั้งหมด", "สมาชิกทั้งหมด", "การลงทะเบียน"].map((label, i) => (
          <div key={label}>
            <div>
              <strong>{counts[i].count ?? 0}</strong>
              <span>{label}</span>
            </div>
          </div>
        ))}
      </div>
      <Link className="button primary" href="/admin/courses/new">
        + สร้างคอร์สใหม่
      </Link>
    </>
  );
}
