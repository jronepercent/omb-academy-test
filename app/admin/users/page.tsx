import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { DeleteButton, EnrollmentForm } from "@/components/admin-forms";
export default async function Users({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const { page = "1", q = "" } = await searchParams;
  const pageNo = Math.max(1, Number.parseInt(page) || 1);
  const { db } = await requireUser(true);
  let query = db
    .from("profiles")
    .select(
      "id,email,full_name,created_at,enrollments(id,course_id,courses(title))",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range((pageNo - 1) * 20, pageNo * 20 - 1);
  if (q) query = query.ilike("email", `%${q.replace(/[%_]/g, "")}%`);
  const [users, courses] = await Promise.all([
    query,
    db.from("courses").select("id,title").order("title"),
  ]);
  if (users.error || courses.error) throw new Error("โหลดสมาชิกไม่สำเร็จ");
  return (
    <>
      <h1>ผู้เรียนและสิทธิ์เข้าเรียน</h1>
      <form className="form-actions" style={{ marginBottom: 24 }}>
        <input
          aria-label="ค้นหาอีเมล"
          name="q"
          placeholder="ค้นหาด้วยอีเมล"
          defaultValue={q}
          style={{ maxWidth: 350 }}
        />
        <button className="button secondary">ค้นหา</button>
      </form>
      <div className="form-grid">
        {users.data.map((u) => (
          <details className="panel" key={u.id}>
            <summary style={{ cursor: "pointer" }}>
              <strong>{u.full_name || "ผู้เรียน"}</strong> · {u.email}
              <span className="small muted" style={{ display: "block" }}>
                สมัครเมื่อ {new Date(u.created_at).toLocaleDateString("th-TH")}{" "}
                · {u.enrollments.length} คอร์ส
              </span>
            </summary>
            <div style={{ marginTop: 22 }}>
              {u.enrollments.map((e) => (
                <div className="form-actions" key={e.id}>
                  <span>
                    {(e.courses as unknown as { title: string } | null)
                      ?.title ?? "คอร์ส"}
                  </span>
                  <DeleteButton
                    table="enrollments"
                    id={e.id}
                    label="ยกเลิกสิทธิ์"
                  />
                </div>
              ))}
              <EnrollmentForm
                userId={u.id}
                courses={(courses.data ?? []).filter(
                  (c) => !u.enrollments.some((e) => e.course_id === c.id),
                )}
              />
            </div>
          </details>
        ))}
      </div>
      {!users.data.length && (
        <p className="empty-state">
          ไม่พบผู้เรียน ให้ผู้เรียนสมัครสมาชิกก่อน แล้วกลับมาให้สิทธิ์ที่นี่
        </p>
      )}
      <div className="form-actions">
        {pageNo > 1 && (
          <Link
            className="button secondary"
            href={`/admin/users?page=${pageNo - 1}&q=${encodeURIComponent(q)}`}
          >
            หน้าก่อน
          </Link>
        )}
        {pageNo * 20 < (users.count ?? 0) && (
          <Link
            className="button secondary"
            href={`/admin/users?page=${pageNo + 1}&q=${encodeURIComponent(q)}`}
          >
            หน้าถัดไป
          </Link>
        )}
      </div>
    </>
  );
}
