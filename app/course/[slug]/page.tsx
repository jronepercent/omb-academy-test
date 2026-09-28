import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { learningData } from "@/lib/data";
import { continueLesson } from "@/lib/types";
import { Shell } from "@/components/shell";
import { Curriculum, Cover } from "@/components/learning";
export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { courses, progress, profile } = await learningData(slug);
  const course = courses[0];
  const next = continueLesson(course, progress);
  return (
    <Shell
      name={profile.full_name}
      admin={profile.role === "admin"}
      active="course"
    >
      <main className="page">
        <Link className="back-link" href="/dashboard">
          <ArrowLeft size={16} />
          กลับคอร์สของฉัน
        </Link>
        <div className="course-layout">
          <div>
            <Cover course={course} large />
            <p className="eyebrow">YOUR NEXT CHAPTER</p>
            <h1>{course.title}</h1>
            <p className="muted spacious">{course.description}</p>
            {next ? (
              <Link
                className="button primary"
                href={`/course/${slug}/lesson/${next.id}`}
              >
                เข้าสู่บทเรียน
                <ArrowRight size={17} />
              </Link>
            ) : (
              <div className="notice">
                กำลังเตรียมบทเรียน กลับมาใหม่เร็ว ๆ นี้
              </div>
            )}
          </div>
          <Curriculum course={course} progress={progress} />
        </div>
      </main>
    </Shell>
  );
}
