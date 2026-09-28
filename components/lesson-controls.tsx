"use client";
import { useEffect, useState, useTransition, startTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { saveProgress } from "@/app/actions";
import { Button } from "./ui/button";
export function LessonControls({
  lessonId,
  completed,
  previous,
  next,
}: {
  lessonId: string;
  completed: boolean;
  previous?: string;
  next?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    startTransition(() => {
      saveProgress(lessonId)
        .then((r) => {
          if (live && r.error) setError(r.error);
        })
        .catch(() => {
          if (live) setError("บันทึกบทเรียนล่าสุดไม่สำเร็จ");
        });
    });
    return () => {
      live = false;
    };
  }, [lessonId]);
  return (
    <>
      {error && (
        <p role="alert" className="notice error">
          {error}
        </p>
      )}
      <div className="lesson-actions">
        {previous ? (
          <Link className="button secondary" href={previous}>
            <ArrowLeft size={16} />
            บทก่อนหน้า
          </Link>
        ) : (
          <span />
        )}
        <Button
          disabled={pending}
          onClick={() =>
            start(async () => {
              setError("");
              try {
                const r = await saveProgress(lessonId, !completed);
                if (r.error) {
                  setError(r.error);
                  return;
                }
                if (!completed && next) router.push(next);
                router.refresh();
              } catch {
                setError("บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง");
              }
            })
          }
        >
          {pending ? (
            "กำลังบันทึก..."
          ) : completed ? (
            <>
              <Check size={16} />
              เรียนจบแล้ว · ยกเลิก
            </>
          ) : (
            <>
              เรียนจบ{next ? "และไปบทถัดไป" : ""}
              <ArrowRight size={16} />
            </>
          )}
        </Button>
      </div>
      {completed &&
        (next ? (
          <Link className="text-link" href={next}>
            ไปบทถัดไป →
          </Link>
        ) : (
          <div className="notice success">
            จบบทเรียนสุดท้ายแล้ว! ดูความคืบหน้าทั้งหมดได้ที่หน้าคอร์ส
          </div>
        ))}
    </>
  );
}
