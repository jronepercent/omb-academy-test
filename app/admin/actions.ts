"use server";
import { requireUser } from "@/lib/auth";
import { youtubeId } from "@/lib/utils";
import { revalidatePath } from "next/cache";
const allowed = ["courses", "modules", "lessons", "enrollments"] as const;
type Table = (typeof allowed)[number];
function value(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}
function integer(form: FormData, key: string) {
  const n = Number(form.get(key));
  if (!Number.isInteger(n) || n < 0 || n > 100000) throw new Error("invalid");
  return n;
}
export async function adminSave(
  table: Table,
  id: string | null,
  form: FormData,
): Promise<{ error?: string; id?: string; success?: boolean }> {
  const { db } = await requireUser(true);
  if (!allowed.includes(table)) return { error: "รายการไม่ถูกต้อง" };
  try {
    let payload: Record<string, unknown> = {};
    if (table === "courses") {
      const title = value(form, "title"),
        slug = value(form, "slug"),
        status = value(form, "status"),
        thumbnail = value(form, "thumbnail_url");
      if (
        !title ||
        title.length > 200 ||
        !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) ||
        !["draft", "published"].includes(status)
      )
        return { error: "กรอกชื่อ, slug ภาษาอังกฤษตัวเล็ก และสถานะให้ถูกต้อง" };
      if (thumbnail) {
        const url = new URL(thumbnail);
        if (url.protocol !== "https:")
          return { error: "รูปปกต้องเป็น URL แบบ https" };
      }
      payload = {
        title,
        slug,
        status,
        description: value(form, "description"),
        thumbnail_url: thumbnail,
      };
    } else if (table === "modules") {
      const title = value(form, "title");
      if (!title || title.length > 200)
        return { error: "กรุณาระบุชื่อหมวด ไม่เกิน 200 ตัวอักษร" };
      payload = {
        title,
        course_id: value(form, "course_id"),
        position: integer(form, "position"),
      };
    } else if (table === "lessons") {
      const title = value(form, "title"),
        url = value(form, "youtube_url"),
        video = youtubeId(url);
      if (!title || title.length > 200 || !video)
        return { error: "กรุณาระบุชื่อบทเรียนและลิงก์ YouTube ให้ถูกต้อง" };
      payload = {
        title,
        module_id: value(form, "module_id"),
        description: value(form, "description"),
        youtube_url: url,
        youtube_video_id: video,
        position: integer(form, "position"),
        duration_minutes: integer(form, "duration_minutes"),
        is_preview: form.get("is_preview") === "on",
      };
    } else {
      payload = {
        user_id: value(form, "user_id"),
        course_id: value(form, "course_id"),
      };
    }
    const result = id
      ? await db.from(table).update(payload).eq("id", id).select("id").single()
      : table === "enrollments"
        ? await db
            .from(table)
            .upsert(payload, { onConflict: "user_id,course_id" })
            .select("id")
            .single()
        : await db.from(table).insert(payload).select("id").single();
    if (result.error)
      return { error: "บันทึกไม่สำเร็จ ตรวจสอบข้อมูลซ้ำหรือการเชื่อมต่อ" };
    revalidatePath("/", "layout");
    return { success: true, id: result.data?.id };
  } catch {
    return { error: "ข้อมูลไม่ถูกต้อง กรุณาตรวจลำดับ ระยะเวลา และ URL" };
  }
}
export async function adminDelete(table: Table, id: string) {
  const { db } = await requireUser(true);
  if (!allowed.includes(table)) return { error: "รายการไม่ถูกต้อง" };
  const { error } = await db.from(table).delete().eq("id", id);
  if (error) return { error: "ลบไม่สำเร็จ กรุณาลองอีกครั้ง" };
  revalidatePath("/", "layout");
  return { success: true };
}
