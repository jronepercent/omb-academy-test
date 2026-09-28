import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("Migration and RLS enforce enrollment, ownership, role integrity, draft visibility and admin CRUD", async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth;
 create table auth.users(id uuid primary key,email text,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth,public to anon,authenticated; grant execute on function auth.uid() to anon,authenticated;`);
    await db.exec(
      await readFile(
        new URL("../supabase/migrations/001_initial.sql", import.meta.url),
        "utf8",
      ),
    );
    await db.exec(
      await readFile(new URL("../supabase/seed.sql", import.meta.url), "utf8"),
    );
    const student = "40000000-0000-4000-8000-000000000001",
      other = "40000000-0000-4000-8000-000000000002",
      admin = "40000000-0000-4000-8000-000000000003";
    const course = "10000000-0000-4000-8000-000000000001",
      lesson = "30000000-0000-4000-8000-000000000001";
    await db.exec(
      `insert into auth.users(id,email,raw_user_meta_data) values ('${student}','student@example.test','{"role":"admin","full_name":"Student"}'),('${other}','other@example.test','{}'),('${admin}','admin@example.test','{}'); update public.profiles set role='admin' where id='${admin}'; insert into public.enrollments(user_id,course_id) values('${student}','${course}');`,
    );
    async function asUser(id: string, sql: string) {
      await db.exec(
        `set role authenticated; select set_config('request.jwt.claim.sub','${id}',false);`,
      );
      try {
        return await db.query(sql);
      } finally {
        await db.exec("reset role");
      }
    }
    const rows = await asUser(student, "select role from profiles");
    assert.equal(rows.rows.length, 1);
    assert.equal((rows.rows[0] as { role: string }).role, "student");
    assert.equal(
      (await asUser(student, "select * from courses")).rows.length,
      1,
    );
    assert.equal(
      (await asUser(student, "select * from modules")).rows.length,
      3,
    );
    assert.equal(
      (await asUser(student, "select * from lessons")).rows.length,
      9,
    );
    assert.equal((await asUser(other, "select * from courses")).rows.length, 0);
    assert.equal((await asUser(other, "select * from modules")).rows.length, 0);
    assert.equal((await asUser(other, "select * from lessons")).rows.length, 0);
    await assert.rejects(
      asUser(student, `update profiles set role='admin' where id='${student}'`),
    );
    await assert.rejects(
      asUser(
        student,
        `insert into enrollments(user_id,course_id) values('${other}','${course}')`,
      ),
    );
    await assert.rejects(
      asUser(
        other,
        `insert into lesson_progress(user_id,lesson_id) values('${other}','${lesson}')`,
      ),
    );
    await asUser(
      student,
      `insert into lesson_progress(user_id,lesson_id,completed) values('${student}','${lesson}',true)`,
    );
    assert.equal(
      (await asUser(other, "select * from lesson_progress")).rows.length,
      0,
    );
    assert.equal(
      (await asUser(student, `update courses set title='hacked' returning id`))
        .rows.length,
      0,
    );
    assert.equal(
      (await asUser(admin, "select * from profiles")).rows.length,
      3,
    );
    await asUser(
      admin,
      `update courses set status='draft' where id='${course}'`,
    );
    assert.equal(
      (await asUser(student, "select * from lessons")).rows.length,
      0,
    );
    assert.equal(
      (
        await asUser(
          student,
          `update lesson_progress set completed=false returning id`,
        )
      ).rows.length,
      0,
    );
    await asUser(
      admin,
      `update courses set status='published' where id='${course}'`,
    );
    await asUser(admin, `delete from enrollments where user_id='${student}'`);
    assert.equal(
      (await asUser(student, "select * from courses")).rows.length,
      0,
    );
    assert.equal(
      (await asUser(student, "select * from lessons")).rows.length,
      0,
    );
    await db.exec("set role anon");
    await assert.rejects(db.query("select * from courses"));
    await db.exec("reset role");
  } finally {
    await db.close();
  }
});
