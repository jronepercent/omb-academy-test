import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { learningData } from "@/lib/data";
import { lessonsOf } from "@/lib/types";
import { Shell } from "@/components/shell";
import { Curriculum } from "@/components/learning";
import { LessonControls } from "@/components/lesson-controls";
export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const { courses, progress, profile } = await learningData(slug);
  const course = courses[0];
  const lessons = lessonsOf(course);
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index < 0) notFound();
  const lesson = lessons[index];
  return (
    <Shell
      name={profile.full_name}
      admin={profile.role === "admin"}
      active="course"
    >
      <main className="page">
        <Link className="back-link" href={`/course/${slug}`}>
          <ArrowLeft size={16} />
          {course.title}
        </Link>
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
            <p className="eyebrow" style={{ marginTop: 28 }}>
              LESSON {String(index + 1).padStart(2, "0")} /{" "}
              {String(lessons.length).padStart(2, "0")}
            </p>
            <h1>{lesson.title}</h1>
            <p className="muted spacious">{lesson.description}</p>
            <LessonControls
              lessonId={lessonId}
              completed={progress.some(
                (p) => p.lesson_id === lessonId && p.completed,
              )}
              previous={
                lessons[index - 1]
                  ? `/course/${slug}/lesson/${lessons[index - 1].id}`
                  : undefined
              }
              next={
                lessons[index + 1]
                  ? `/course/${slug}/lesson/${lessons[index + 1].id}`
                  : undefined
              }
            />
          </div>
          <Curriculum course={course} progress={progress} current={lessonId} />
        </div>
      </main>
    </Shell>
  );
}
