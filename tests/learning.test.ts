import test from "node:test";
import assert from "node:assert/strict";
import { youtubeId } from "../lib/utils";
import {
  courseStats,
  continueLesson,
  lessonsOf,
  type Progress,
} from "../lib/types";
import { demoCourse } from "../lib/demo";
test("YouTube URL parsing accepts known formats, rejects lookalike hosts and malformed IDs", () => {
  for (const url of [
    "https://youtube.com/watch?v=jNQXAC9IVRw&t=3",
    "https://www.youtube.com/embed/jNQXAC9IVRw",
    "https://youtu.be/jNQXAC9IVRw",
    "https://m.youtube.com/watch?v=jNQXAC9IVRw",
  ])
    assert.equal(youtubeId(url), "jNQXAC9IVRw");
  for (const url of [
    "https://youtube.com.evil.com/watch?v=jNQXAC9IVRw",
    "javascript:alert(1)",
    "https://youtu.be/short",
    "garbage",
  ])
    assert.equal(youtubeId(url), null);
});
test("Progress is scoped to course lessons and handles empty courses", () => {
  const p: Progress[] = [
    {
      lesson_id: "start-0",
      completed: true,
      last_watched_seconds: 0,
      updated_at: "2026-01-01",
    },
    {
      lesson_id: "other-course",
      completed: true,
      last_watched_seconds: 0,
      updated_at: "2026-01-01",
    },
  ];
  assert.deepEqual(courseStats(demoCourse, p), {
    done: 1,
    total: 9,
    percent: 11,
  });
  assert.equal(courseStats({ ...demoCourse, modules: [] }, []).percent, 0);
});
test("Continue selects last opened incomplete, then first incomplete, then review", () => {
  const lessons = lessonsOf(demoCourse);
  const p: Progress[] = lessons
    .slice(0, 3)
    .map((l, i) => ({
      lesson_id: l.id,
      completed: i === 0,
      last_watched_seconds: 0,
      updated_at: `2026-01-0${i + 1}`,
    }));
  assert.equal(continueLesson(demoCourse, p)?.id, "start-2");
  assert.equal(
    continueLesson(
      demoCourse,
      p.map((x) => ({ ...x, completed: true })),
    )?.id,
    "lesson-0-0",
  );
  assert.equal(
    continueLesson(
      demoCourse,
      lessons.map((l) => ({
        lesson_id: l.id,
        completed: true,
        last_watched_seconds: 0,
        updated_at: "2026-01-01",
      })),
    )?.id,
    "start-0",
  );
});
