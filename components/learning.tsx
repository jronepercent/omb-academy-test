import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Play,
} from "lucide-react";
import {
  type Course,
  type Progress,
  type Lesson,
  courseStats,
  continueLesson,
  lessonsOf,
} from "@/lib/types";
export function ProgressBar({ value }: { value: number }) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label="ความคืบหน้าการเรียน"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
    >
      <div style={{ width: `${value}%` }} />
    </div>
  );
}
export function Cover({
  course,
  large = false,
}: {
  course: Course;
  large?: boolean;
}) {
  return (
    <div className={`course-cover ${large ? "large" : ""}`}>
      {course.thumbnail_url ? (
        <Image
          src={course.thumbnail_url}
          alt={course.title}
          fill
          sizes="(max-width: 700px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
      ) : (
        <>
          <span className="cover-kicker">THE CREATOR SERIES / 01</span>
          <div className="cover-title">
            {course.title === "ONE MAN BUSINESS" ? (
              <>
                ONE MAN
                <br />
                <span>BUSINESS.</span>
              </>
            ) : (
              course.title
            )}
          </div>
          <span className="cover-bottom">
            BUILD A BUSINESS. DESIGN YOUR LIFE.
            <span className="cover-mark">↗</span>
          </span>
        </>
      )}
    </div>
  );
}
export function Dashboard({
  courses,
  progress,
  name,
  demo = false,
}: {
  courses: Course[];
  progress: Progress[];
  name: string;
  demo?: boolean;
}) {
  const first =
    courses.find((c) => courseStats(c, progress).percent < 100) ?? courses[0];
  const stats = courses.map((c) => courseStats(c, progress));
  const lesson = first ? continueLesson(first, progress) : undefined;
  const href = (c: Course, l?: Lesson) =>
    demo
      ? l
        ? `/demo/lesson/${l.id}`
        : "/demo/course"
      : l
        ? `/course/${c.slug}/lesson/${l.id}`
        : `/course/${c.slug}`;
  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">YOUR LEARNING JOURNEY</p>
          <h1>
            ยินดีต้อนรับกลับมา, {name}
            <span className="red">.</span>
          </h1>
          <p className="muted">
            ทุกก้าวเล็ก ๆ พาคุณเข้าใกล้ธุรกิจในแบบของตัวเอง
          </p>
        </div>
        <span className="outline-badge">MEMBER SPACE</span>
      </div>
      <div className="stats">
        <div>
          <span className="stat-icon">
            <BookOpen size={21} />
          </span>
          <div>
            <strong>{courses.length.toString().padStart(2, "0")}</strong>
            <span>คอร์สของคุณ</span>
          </div>
        </div>
        <div>
          <span className="stat-icon">
            <CheckCircle2 size={21} />
          </span>
          <div>
            <strong>
              {stats
                .reduce((sum, s) => sum + s.done, 0)
                .toString()
                .padStart(2, "0")}
            </strong>
            <span>บทเรียนที่เรียนจบ</span>
          </div>
        </div>
        <div>
          <span className="stat-icon">
            <Clock3 size={21} />
          </span>
          <div>
            <strong>
              {stats.length
                ? Math.round(
                    stats.reduce((sum, s) => sum + s.percent, 0) / stats.length,
                  )
                : 0}
              <small>%</small>
            </strong>
            <span>ความคืบหน้าโดยรวม</span>
          </div>
        </div>
      </div>
      {first && lesson && (
        <section className="continue-panel">
          <div>
            <span className="eyebrow">
              {courseStats(first, progress).percent === 100
                ? "KEEP EXPLORING"
                : "PICK UP WHERE YOU LEFT OFF"}
            </span>
            <h2>
              {courseStats(first, progress).percent === 100
                ? "กลับมาทบทวนสิ่งที่ได้เรียน"
                : "พร้อมไปต่ออีกหนึ่งบทไหม?"}
            </h2>
            <p className="muted">
              {first.title} <span className="divider">/</span> {lesson.title}
            </p>
            <Link className="button primary" href={href(first, lesson)}>
              <Play size={16} fill="currentColor" />
              {courseStats(first, progress).percent === 100
                ? "ทบทวนคอร์ส"
                : "เรียนต่อจากที่ค้างไว้"}
              <ArrowRight size={17} />
            </Link>
          </div>
          <div className="continue-number">
            <span>บทเรียนถัดไป</span>
            <strong>
              {String(
                lessonsOf(first).findIndex((l) => l.id === lesson.id) + 1,
              ).padStart(2, "0")}
              <i> / {String(lessonsOf(first).length).padStart(2, "0")}</i>
            </strong>
            <span>{lesson.duration_minutes} นาที · เรียนได้ในเวลาของคุณ</span>
          </div>
        </section>
      )}
      <section id="courses">
        <div className="section-heading">
          <h2>
            คอร์สของฉัน <span className="count">{courses.length}</span>
          </h2>
          <span className="muted small">
            เส้นทางสู่ธุรกิจของคุณ เริ่มตรงนี้
          </span>
        </div>
        {courses.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={36} />
            <h2>ยังไม่มีคอร์ส</h2>
            <p className="muted">
              ติดต่อผู้ดูแลเพื่อรับสิทธิ์เข้าเรียน แล้วคอร์สของคุณจะปรากฏที่นี่
            </p>
          </div>
        ) : (
          <div className="course-grid">
            {courses.map((c) => {
              const s = courseStats(c, progress);
              return (
                <article className="course-card" key={c.id}>
                  <Link href={href(c)} aria-label={`ดูคอร์ส ${c.title}`}>
                    <Cover course={c} />
                  </Link>
                  <div className="course-card-body">
                    <span className="eyebrow">BUSINESS & CREATOR</span>
                    <h3>
                      <Link href={href(c)}>{c.title}</Link>
                    </h3>
                    <p className="muted course-description">{c.description}</p>
                    <div className="course-meta">
                      <span>
                        <BookOpen size={14} />
                        {s.total} บทเรียน
                      </span>
                      <span>
                        <Clock3 size={14} />
                        {lessonsOf(c).reduce(
                          (a, l) => a + l.duration_minutes,
                          0,
                        )}{" "}
                        นาที
                      </span>
                    </div>
                    <div className="progress-label">
                      <span>
                        เรียนแล้ว {s.done} / {s.total} บท
                      </span>
                      <strong>{s.percent}%</strong>
                    </div>
                    <ProgressBar value={s.percent} />
                    <Link
                      className="button secondary full"
                      href={href(c, continueLesson(c, progress))}
                    >
                      {s.percent === 100 ? "ทบทวนคอร์ส" : "เข้าสู่บทเรียน"}
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </article>
              );
            })}
            <div className="learning-note">
              <span className="eyebrow">A NOTE FOR YOU</span>
              <h2>
                ไม่ต้องเก่งก่อนเริ่ม
                <br />
                แค่เริ่ม แล้วค่อย ๆ เก่งขึ้น
              </h2>
              <p className="muted">
                ให้เวลากับตัวเอง เรียนรู้ทีละบท
                <br />
                และนำไปลงมือทำจริง
              </p>
              <span className="note-signature">— OMB ACADEMY</span>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
export function Curriculum({
  course,
  progress,
  current,
  demo = false,
}: {
  course: Course;
  progress: Progress[];
  current?: string;
  demo?: boolean;
}) {
  const s = courseStats(course, progress);
  return (
    <div className="curriculum">
      <div className="curriculum-head">
        <span className="eyebrow">COURSE CONTENT</span>
        <h3>{course.title}</h3>
        <div className="progress-label">
          <span>
            {s.done} / {s.total} บทเรียน
          </span>
          <strong>{s.percent}%</strong>
        </div>
        <ProgressBar value={s.percent} />
      </div>
      {[...course.modules]
        .sort((a, b) => a.position - b.position)
        .map((m, i) => (
          <details open key={m.id}>
            <summary>
              <span className="module-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              {m.title}
              <ChevronRight size={16} />
            </summary>
            {[...m.lessons]
              .sort((a, b) => a.position - b.position)
              .map((l) => {
                const done = progress.some(
                  (p) => p.lesson_id === l.id && p.completed,
                );
                return (
                  <Link
                    key={l.id}
                    className={`lesson-item ${current === l.id ? "selected" : ""}`}
                    href={
                      demo
                        ? `/demo/lesson/${l.id}`
                        : `/course/${course.slug}/lesson/${l.id}`
                    }
                  >
                    <span className={`lesson-state ${done ? "done" : ""}`}>
                      {done ? <Check size={13} /> : <Play size={11} />}
                    </span>
                    <span>
                      {l.title}
                      <small>{l.duration_minutes} นาที</small>
                    </span>
                  </Link>
                );
              })}
          </details>
        ))}
    </div>
  );
}
