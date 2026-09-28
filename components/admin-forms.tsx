"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { adminSave, adminDelete } from "@/app/admin/actions";
import { youtubeId } from "@/lib/utils";
import type { Course, Module, Lesson } from "@/lib/types";
import { Button } from "./ui/button";
type Table = "courses" | "modules" | "lessons" | "enrollments";
function SaveForm({
  table,
  id = null,
  children,
  createdPath,
}: {
  table: Table;
  id?: string | null;
  children: React.ReactNode;
  createdPath?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [message, setMessage] = useState("");
  return (
    <form
      className="form-grid"
      action={(data) =>
        start(async () => {
          setMessage("");
          try {
            const result = await adminSave(table, id, data);
            if (result.error) {
              setMessage(result.error);
              return;
            }
            setMessage("บันทึกเรียบร้อยแล้ว");
            if (createdPath && result.id) router.push(createdPath + result.id);
            router.refresh();
          } catch {
            setMessage("บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง");
          }
        })
      }
    >
      {children}
      <div>
        <Button disabled={pending}>
          {pending
            ? "กำลังบันทึก..."
            : id
              ? "บันทึกการเปลี่ยนแปลง"
              : "เพิ่มรายการ"}
        </Button>
      </div>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </form>
  );
}
export function DeleteButton({
  table,
  id,
  label = "ลบ",
  returnTo,
}: {
  table: Table;
  id: string;
  label?: string;
  returnTo?: string;
}) {
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
  return (
    <>
      <Button
        variant="ghost"
        className="danger"
        disabled={pending}
        onClick={() => {
          if (
            !window.confirm(
              table === "enrollments"
                ? "ยืนยันยกเลิกสิทธิ์เข้าเรียน? ความคืบหน้าเดิมจะยังเก็บไว้"
                : "ยืนยันการลบ? ข้อมูลที่อยู่ภายในและความคืบหน้าที่เกี่ยวข้องจะถูกลบด้วย",
            )
          )
            return;
          start(async () => {
            try {
              const r = await adminDelete(table, id);
              if (r.error) setError(r.error);
              else {
                if (returnTo) router.push(returnTo);
                router.refresh();
              }
            } catch {
              setError("ลบไม่สำเร็จ");
            }
          });
        }}
      >
        {pending ? "กำลังลบ..." : label}
      </Button>
      {error && <p role="alert">{error}</p>}
    </>
  );
}
export function CourseForm({ course }: { course?: Course }) {
  return (
    <SaveForm
      table="courses"
      id={course?.id}
      createdPath={course ? undefined : "/admin/courses/"}
    >
      <div className="two-col">
        <label>
          ชื่อคอร์ส
          <input
            name="title"
            required
            maxLength={200}
            defaultValue={course?.title}
          />
        </label>
        <label>
          Slug (เช่น one-man-business)
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={course?.slug}
          />
        </label>
      </div>
      <label>
        คำอธิบาย
        <textarea name="description" defaultValue={course?.description} />
      </label>
      <label>
        ลิงก์รูปปก (https)
        <input
          type="url"
          name="thumbnail_url"
          defaultValue={course?.thumbnail_url}
        />
      </label>
      <label>
        สถานะ
        <select name="status" defaultValue={course?.status ?? "draft"}>
          <option value="draft">ฉบับร่าง</option>
          <option value="published">เผยแพร่</option>
        </select>
      </label>
    </SaveForm>
  );
}
export function ModuleForm({
  courseId,
  module,
  position = 1,
}: {
  courseId: string;
  module?: Module;
  position?: number;
}) {
  return (
    <SaveForm table="modules" id={module?.id}>
      <input type="hidden" name="course_id" value={courseId} />
      <div className="two-col">
        <label>
          ชื่อหมวด
          <input
            name="title"
            required
            maxLength={200}
            defaultValue={module?.title}
          />
        </label>
        <label>
          ลำดับ
          <input
            type="number"
            name="position"
            min={0}
            required
            defaultValue={module?.position ?? position}
          />
        </label>
      </div>
    </SaveForm>
  );
}
export function LessonForm({
  moduleId,
  lesson,
  position = 1,
}: {
  moduleId: string;
  lesson?: Lesson;
  position?: number;
}) {
  const [url, setUrl] = useState(lesson?.youtube_url ?? "");
  const video = youtubeId(url);
  return (
    <SaveForm table="lessons" id={lesson?.id}>
      <input type="hidden" name="module_id" value={moduleId} />
      <label>
        ชื่อบทเรียน
        <input
          name="title"
          required
          maxLength={200}
          defaultValue={lesson?.title}
        />
      </label>
      <label>
        รายละเอียด
        <textarea name="description" defaultValue={lesson?.description} />
      </label>
      <label>
        YouTube URL
        <input
          type="url"
          name="youtube_url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      {url && !video && (
        <p className="danger small">ลิงก์ YouTube ไม่ถูกต้อง</p>
      )}
      {video && (
        <div className="video-wrap">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video}`}
            title="ตัวอย่างวิดีโอบทเรียน"
            allowFullScreen
          />
        </div>
      )}
      <div className="two-col">
        <label>
          ระยะเวลา (นาที)
          <input
            name="duration_minutes"
            type="number"
            required
            min={0}
            defaultValue={lesson?.duration_minutes ?? 0}
          />
        </label>
        <label>
          ลำดับ (เปลี่ยนตัวเลขเพื่อย้ายบท)
          <input
            name="position"
            type="number"
            min={0}
            required
            defaultValue={lesson?.position ?? position}
          />
        </label>
      </div>
      <label className="checkbox-label">
        <input
          name="is_preview"
          type="checkbox"
          defaultChecked={lesson?.is_preview}
        />
          กำหนดเป็นบทแนะนำ (ผู้เรียนยังต้องได้รับสิทธิ์เข้าเรียน)
      </label>
    </SaveForm>
  );
}
export function EnrollmentForm({
  userId,
  courses,
}: {
  userId: string;
  courses: { id: string; title: string }[];
}) {
  if (!courses.length)
    return (
      <p className="muted small">
        ได้รับสิทธิ์ครบทุกคอร์สแล้ว หรือยังไม่มีคอร์ส
      </p>
    );
  return (
    <SaveForm table="enrollments">
      <input type="hidden" name="user_id" value={userId} />
      <label>
        ให้สิทธิ์คอร์ส
        <select name="course_id" required>
          {courses.map((c) => (
            <option value={c.id} key={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>
    </SaveForm>
  );
}
