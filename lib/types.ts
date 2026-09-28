export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: "student" | "admin";
  created_at: string;
};
export type Lesson = {
  id: string;
  module_id: string;
  title: string;
  description: string;
  youtube_url: string;
  youtube_video_id: string;
  position: number;
  duration_minutes: number;
  is_preview: boolean;
};
export type Module = {
  id: string;
  course_id: string;
  title: string;
  position: number;
  lessons: Lesson[];
};
export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail_url: string;
  status: "draft" | "published";
  modules: Module[];
};
export type Progress = {
  lesson_id: string;
  completed: boolean;
  updated_at: string;
  last_watched_seconds: number;
};
export function lessonsOf(course: Course) {
  return [...course.modules]
    .sort((a, b) => a.position - b.position)
    .flatMap((m) => [...m.lessons].sort((a, b) => a.position - b.position));
}
export function courseStats(course: Course, progress: Progress[]) {
  const lessons = lessonsOf(course);
  const done = lessons.filter((l) =>
    progress.some((p) => p.lesson_id === l.id && p.completed),
  ).length;
  return {
    total: lessons.length,
    done,
    percent: lessons.length ? Math.round((done / lessons.length) * 100) : 0,
  };
}
export function continueLesson(course: Course, progress: Progress[]) {
  const lessons = lessonsOf(course);
  const incomplete = lessons.filter(
    (l) => !progress.some((p) => p.lesson_id === l.id && p.completed),
  );
  const recent = [...progress]
    .filter((p) => !p.completed && incomplete.some((l) => l.id === p.lesson_id))
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0];
  return (
    incomplete.find((l) => l.id === recent?.lesson_id) ??
    incomplete[0] ??
    lessons[0]
  );
}
