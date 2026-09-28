import Link from "next/link";
import { requireUser } from "@/lib/auth";
export default async function Courses() {
  const { db } = await requireUser(true);
  const { data, error } = await db
    .from("courses")
    .select("id,title,status,modules(lessons(id)),enrollments(count)")
    .order("created_at", { ascending: false });
  if (error) throw new Error("โหลดคอร์สไม่สำเร็จ");
  return (
    <>
      <div className="section-heading">
        <h1>จัดการคอร์ส</h1>
        <Link className="button primary" href="/admin/courses/new">
          + คอร์สใหม่
        </Link>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>คอร์ส</th>
              <th>สถานะ</th>
              <th>บทเรียน</th>
              <th>ผู้เรียน</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}>
                <td>{c.title}</td>
                <td>{c.status === "published" ? "เผยแพร่" : "ฉบับร่าง"}</td>
                <td>{c.modules.reduce((n, m) => n + m.lessons.length, 0)}</td>
                <td>{c.enrollments[0]?.count ?? 0}</td>
                <td>
                  <Link
                    className="button secondary"
                    href={`/admin/courses/${c.id}`}
                  >
                    แก้ไข
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data.length && (
          <p className="empty-state">ยังไม่มีคอร์ส เริ่มสร้างคอร์สแรกได้เลย</p>
        )}
      </div>
    </>
  );
}
