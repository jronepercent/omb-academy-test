import "server-only";
import { requireUser } from "./auth";
import type { Course, Progress } from "./types";
import { notFound } from "next/navigation";
export async function learningData(slug?: string) {
  const { db, profile, user } = await requireUser();
  let query = db
    .from("courses")
    .select("*, modules(*, lessons(*))")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  if (slug) query = query.eq("slug", slug);
  const { data, error } = await query;
  if (error) throw new Error("โหลดคอร์สไม่สำเร็จ");
  const courses = (data ?? []) as Course[];
  if (slug && !courses.length) notFound();
  const ids = courses.flatMap((c) =>
    c.modules.flatMap((m) => m.lessons.map((l) => l.id)),
  );
  let progress: Progress[] = [];
  if (ids.length) {
    const { data: rows, error: pError } = await db
      .from("lesson_progress")
      .select("lesson_id,completed,updated_at,last_watched_seconds")
      .eq("user_id", user.id)
      .in("lesson_id", ids);
    if (pError) throw new Error("โหลดความคืบหน้าไม่สำเร็จ");
    progress = rows ?? [];
  }
  return { courses, progress, profile };
}
