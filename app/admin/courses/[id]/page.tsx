import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import type { Course } from "@/lib/types";
import {
  CourseForm,
  ModuleForm,
  LessonForm,
  DeleteButton,
} from "@/components/admin-forms";
export default async function Editor({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { db } = await requireUser(true);
  let course: Course | undefined;
  if (id !== "new") {
    const { data, error } = await db
      .from("courses")
      .select("*, modules(*, lessons(*))")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error("โหลดคอร์สไม่สำเร็จ");
    if (!data) notFound();
    course = data as Course;
  }
  return (
    <div className="admin-form">
      <h1>{course ? "แก้ไขคอร์ส" : "สร้างคอร์สใหม่"}</h1>
      <div className="panel">
        <CourseForm course={course} />
        {course && (
          <div className="form-actions">
            <DeleteButton
              table="courses"
              id={id}
              label="ลบคอร์สและเนื้อหาทั้งหมด"
              returnTo="/admin/courses"
            />
          </div>
        )}
      </div>
      {course && (
        <>
          <h2 style={{ marginTop: 32 }}>เนื้อหาคอร์ส</h2>
          <p className="muted small">
            กำหนดตัวเลขลำดับเพื่อจัดเรียงหมวดและบทเรียน จากน้อยไปมาก
          </p>
          {[...course.modules]
            .sort((a, b) => a.position - b.position)
            .map((m) => (
              <section key={m.id} className="editor-module">
                <ModuleForm courseId={id} module={m} />
                <DeleteButton table="modules" id={m.id} label="ลบหมวดนี้" />
                {[...m.lessons]
                  .sort((a, b) => a.position - b.position)
                  .map((l) => (
                    <details className="editor-lesson" key={l.id}>
                      <summary>
                        {l.position}. {l.title}
                      </summary>
                      <LessonForm moduleId={m.id} lesson={l} />
                      <DeleteButton
                        table="lessons"
                        id={l.id}
                        label="ลบบทเรียนนี้"
                      />
                    </details>
                  ))}
                <details className="editor-lesson">
                  <summary>+ เพิ่มบทเรียน</summary>
                  <LessonForm
                    moduleId={m.id}
                    position={
                      Math.max(0, ...m.lessons.map((l) => l.position)) + 1
                    }
                  />
                </details>
              </section>
            ))}
          <section className="editor-module">
            <h3>+ เพิ่มหมวดใหม่</h3>
            <ModuleForm
              courseId={id}
              position={
                Math.max(0, ...course.modules.map((m) => m.position)) + 1
              }
            />
          </section>
        </>
      )}
    </div>
  );
}
