"use server";
import { requireUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
export async function saveProgress(lessonId: string, completed?: boolean) {
  const { db, user } = await requireUser();
  const { data: lesson } = await db
    .from("lessons")
    .select("id")
    .eq("id", lessonId)
    .maybeSingle();
  if (!lesson) return { error: "ไม่พบบทเรียนหรือไม่มีสิทธิ์เข้าเรียน" };
  let error;
  if (completed === undefined) {
    const { data: existing } = await db
      .from("lesson_progress")
      .select("id")
      .eq("user_id", user.id)
      .eq("lesson_id", lessonId)
      .maybeSingle();
    const result = existing
      ? await db
          .from("lesson_progress")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", existing.id)
      : await db
          .from("lesson_progress")
          .insert({ user_id: user.id, lesson_id: lessonId });
    error = result.error;
  } else {
    const result = await db
      .from("lesson_progress")
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          completed,
          completed_at: completed ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,lesson_id" },
      );
    error = result.error;
  }
  if (error) return { error: "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง" };
  revalidatePath("/dashboard");
  revalidatePath("/course", "layout");
  return { success: true };
}
export async function updateProfile(form: FormData) {
  const { db, user } = await requireUser();
  const name = String(form.get("full_name") ?? "").trim();
  if (!name || name.length > 100)
    return { error: "กรุณาระบุชื่อไม่เกิน 100 ตัวอักษร" };
  const { error } = await db
    .from("profiles")
    .update({ full_name: name })
    .eq("id", user.id);
  if (error) return { error: "บันทึกชื่อไม่สำเร็จ" };
  revalidatePath("/", "layout");
  return { success: true };
}
