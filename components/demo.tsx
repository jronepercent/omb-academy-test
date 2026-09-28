"use client";
import { useSyncExternalStore, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Shell } from "./shell";
import { Dashboard, Curriculum, Cover } from "./learning";
import { Button } from "./ui/button";
import { demoCourse } from "@/lib/demo";
import { lessonsOf, type Progress } from "@/lib/types";
const KEY = "omb-beta-progress-v1";
const subscribe = (cb: () => void) => {
  window.addEventListener("storage", cb);
  window.addEventListener("omb-progress", cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener("omb-progress", cb);
  };
};
const snapshot = () => {
  try {
    return localStorage.getItem(KEY) ?? "[]";
  } catch {
    return "[]";
  }
};
function save(progress: Progress[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
    window.dispatchEvent(new Event("omb-progress"));
  } catch {
    alert("เบราว์เซอร์ไม่อนุญาตให้บันทึกข้อมูลทดลอง");
  }
}
export function Demo({
  view = "dashboard",
  lessonId,
}: {
  view?: "dashboard" | "course" | "lesson";
  lessonId?: string;
}) {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "[]");
  let progress: Progress[] = [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed))
      progress = parsed.filter(
        (p) =>
          p &&
          typeof p.lesson_id === "string" &&
          typeof p.completed === "boolean" &&
          typeof p.updated_at === "string",
      );
  } catch {}
  const router = useRouter();
  const all = lessonsOf(demoCourse);
  const index = all.findIndex((l) => l.id === lessonId);
  const lesson = all[index];
  useEffect(() => {
    if (
      view !== "lesson" ||
      !lessonId ||
      !lessonsOf(demoCourse).some((l) => l.id === lessonId)
    )
      return;
    let previous: Progress[] = [];
    try {
      previous = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (!Array.isArray(previous)) previous = [];
      previous = previous.filter(
        (p) =>
          p &&
          typeof p.lesson_id === "string" &&
          typeof p.completed === "boolean",
      );
    } catch {}
    const found = previous.find((p) => p.lesson_id === lessonId);
    save([
      ...previous.filter((p) => p.lesson_id !== lessonId),
      {
        lesson_id: lessonId,
        completed: found?.completed ?? false,
        last_watched_seconds: 0,
        updated_at: new Date().toISOString(),
      },
    ]);
  }, [view, lessonId]);
  const complete = () => {
    const done = progress.some((p) => p.lesson_id === lessonId && p.completed);
    save([
      ...progress.filter((p) => p.lesson_id !== lessonId),
      {
        lesson_id: lessonId!,
        completed: !done,
        last_watched_seconds: 0,
        updated_at: new Date().toISOString(),
      },
    ]);
    if (!done && all[index + 1])
      router.push(`/demo/lesson/${all[index + 1].id}`);
  };
  return (
    <Shell
      name="Creator"
      demo
      active={view === "dashboard" ? "dashboard" : "course"}
    >
      {view === "dashboard" ? (
        <Dashboard
          courses={[demoCourse]}
          progress={progress}
          name="Creator"
          demo
        />
      ) : (
        <main className="page">
          <Link className="back-link" href="/demo">
            <ArrowLeft size={16} />
            กลับคอร์สของฉัน
          </Link>
          {view === "course" ? (
            <div className="course-layout">
              <div>
                <Cover course={demoCourse} large />
                <p className="eyebrow">YOUR NEXT CHAPTER</p>
                <h1>{demoCourse.title}</h1>
                <p className="muted spacious">{demoCourse.description}</p>
                <Link href="/demo/lesson/start-0" className="button primary">
                  เริ่มบทเรียนแรก
                  <ArrowRight size={18} />
                </Link>
              </div>
              <Curriculum course={demoCourse} progress={progress} demo />
            </div>
          ) : lesson ? (
            <div className="player-layout">
              <div>
                <div className="video-wrap">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${lesson.youtube_video_id}`}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <p className="video-note">
                  วิดีโอตัวอย่างสำหรับทดสอบระบบ •
                  เปลี่ยนเป็นเนื้อหาจริงได้ในหลังบ้าน
                </p>
                <p className="eyebrow">
                  LESSON {String(index + 1).padStart(2, "0")} /{" "}
                  {String(all.length).padStart(2, "0")}
                </p>
                <h1>{lesson.title}</h1>
                <p className="muted spacious">{lesson.description}</p>
                <div className="lesson-actions">
                  {all[index - 1] ? (
                    <Link
                      className="button secondary"
                      href={`/demo/lesson/${all[index - 1].id}`}
                    >
                      <ArrowLeft size={16} />
                      บทก่อนหน้า
                    </Link>
                  ) : (
                    <span />
                  )}
                  <Button onClick={complete}>
                    {progress.some(
                      (p) => p.lesson_id === lesson.id && p.completed,
                    ) ? (
                      <>
                        <Check size={16} />
                        เรียนจบแล้ว · ยกเลิก
                      </>
                    ) : (
                      <>
                        เรียนจบ{all[index + 1] ? "และไปบทถัดไป" : ""}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </Button>
                </div>
                {progress.some(
                  (p) => p.lesson_id === lesson.id && p.completed,
                ) &&
                  all[index + 1] && (
                    <Link
                      className="text-link"
                      href={`/demo/lesson/${all[index + 1].id}`}
                    >
                      ไปบทถัดไป →
                    </Link>
                  )}
                {progress.filter((p) => p.completed).length === all.length && (
                  <div className="notice success">
                    ยินดีด้วย! คุณเรียนครบทุกบทแล้ว กลับมาทบทวนได้เสมอ
                  </div>
                )}
              </div>
              <Curriculum
                course={demoCourse}
                progress={progress}
                current={lesson.id}
                demo
              />
            </div>
          ) : (
            <div className="empty-state">
              <h1>ไม่พบบทเรียน</h1>
              <Link href="/demo/course">กลับหน้าคอร์ส</Link>
            </div>
          )}
        </main>
      )}
    </Shell>
  );
}
