-- OMB Academy beta: run once in a NEW Supabase project.
-- Creates tables, RLS policies, and the sample course.

-- Run once in a new Supabase project's SQL Editor. No service-role key is used by the app.
begin;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email text not null, full_name text not null default '', avatar_url text,
 role text not null default 'student' check (role in ('student','admin')),
 created_at timestamptz not null default now()
);
create table public.courses (
 id uuid primary key default gen_random_uuid(), title text not null check (length(title) between 1 and 200),
 slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'), description text not null default '',
 thumbnail_url text not null default '', status text not null default 'draft' check (status in ('draft','published')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.modules (
 id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade,
 title text not null check(length(title) between 1 and 200), position integer not null default 1 check(position>=0), created_at timestamptz not null default now()
);
create table public.lessons (
 id uuid primary key default gen_random_uuid(), module_id uuid not null references public.modules(id) on delete cascade,
 title text not null check(length(title) between 1 and 200), description text not null default '',
 youtube_url text not null, youtube_video_id text not null check(youtube_video_id ~ '^[A-Za-z0-9_-]{11}$'),
 position integer not null default 1 check(position>=0), duration_minutes integer not null default 0 check(duration_minutes>=0),
 is_preview boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.enrollments (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 course_id uuid not null references public.courses(id) on delete cascade, created_at timestamptz not null default now(), unique(user_id,course_id)
);
create table public.lesson_progress (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
 lesson_id uuid not null references public.lessons(id) on delete cascade,
 completed boolean not null default false, completed_at timestamptz,
 last_watched_seconds integer not null default 0 check(last_watched_seconds>=0), updated_at timestamptz not null default now(), unique(user_id,lesson_id)
);
create index modules_course_idx on public.modules(course_id,position);
create index lessons_module_idx on public.lessons(module_id,position);
create index enrollments_course_idx on public.enrollments(course_id);
create index progress_lesson_idx on public.lesson_progress(lesson_id);

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,email,full_name,role) values(new.id,coalesce(new.email,''),left(coalesce(new.raw_user_meta_data->>'full_name','ผู้เรียน'),100),'student');
 return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
create function public.sync_user_email() returns trigger language plpgsql security definer set search_path='' as $$
begin update public.profiles set email=coalesce(new.email,'') where id=new.id; return new; end; $$;
create trigger on_auth_email_updated after update of email on auth.users for each row execute function public.sync_user_email();

-- SECURITY DEFINER helpers avoid recursive profile/course RLS. Identity always comes from auth.uid().
create function public.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'); $$;
create function public.can_access_course(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select public.is_admin() or exists(select 1 from public.courses c join public.enrollments e on e.course_id=c.id where c.id=target and c.status='published' and e.user_id=(select auth.uid())); $$;
create function public.can_access_lesson(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.lessons l join public.modules m on m.id=l.module_id where l.id=target and public.can_access_course(m.course_id)); $$;
revoke all on function public.handle_new_user(),public.sync_user_email(),public.is_admin(),public.can_access_course(uuid),public.can_access_lesson(uuid) from public,anon;
grant execute on function public.is_admin(),public.can_access_course(uuid),public.can_access_lesson(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;

revoke all on public.profiles,public.courses,public.modules,public.lessons,public.enrollments,public.lesson_progress from anon,authenticated;
grant select on public.profiles to authenticated;
-- Column privileges prevent role/email escalation even by direct REST requests.
grant update(full_name,avatar_url) on public.profiles to authenticated;
grant select,insert,update,delete on public.courses,public.modules,public.lessons,public.enrollments to authenticated;
grant select,insert,update on public.lesson_progress to authenticated;

create policy profiles_read on public.profiles for select to authenticated using(id=(select auth.uid()) or public.is_admin());
create policy profiles_update on public.profiles for update to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
create policy courses_read on public.courses for select to authenticated using(public.can_access_course(id));
create policy courses_admin on public.courses for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy modules_read on public.modules for select to authenticated using(public.can_access_course(course_id));
create policy modules_admin on public.modules for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy lessons_read on public.lessons for select to authenticated using(public.can_access_lesson(id));
create policy lessons_admin on public.lessons for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy enrollments_read on public.enrollments for select to authenticated using(user_id=(select auth.uid()) or public.is_admin());
create policy enrollments_admin on public.enrollments for all to authenticated using(public.is_admin()) with check(public.is_admin());
create policy progress_read on public.lesson_progress for select to authenticated using(user_id=(select auth.uid()));
create policy progress_insert on public.lesson_progress for insert to authenticated with check(user_id=(select auth.uid()) and public.can_access_lesson(lesson_id));
create policy progress_update on public.lesson_progress for update to authenticated using(user_id=(select auth.uid()) and public.can_access_lesson(lesson_id)) with check(user_id=(select auth.uid()) and public.can_access_lesson(lesson_id));

create function public.touch_updated_at() returns trigger language plpgsql set search_path='' as $$ begin new.updated_at=now();return new;end; $$;
create trigger course_updated before update on public.courses for each row execute function public.touch_updated_at();
create trigger lesson_updated before update on public.lessons for each row execute function public.touch_updated_at();
create trigger progress_updated before update on public.lesson_progress for each row execute function public.touch_updated_at();
commit;


-- Safe to rerun. Example video is a placeholder, not course teaching material.
begin;
insert into public.courses(id,title,slug,description,status) values
('10000000-0000-4000-8000-000000000001','ONE MAN BUSINESS','one-man-business','เปลี่ยนความรู้และทักษะของคุณให้กลายเป็นธุรกิจออนไลน์ที่คุณสามารถบริหารได้ด้วยตัวเอง','published') on conflict do nothing;
insert into public.modules(id,course_id,title,position) values
('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','START — วางรากฐานธุรกิจ',1),
('20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','OFFER — สร้างข้อเสนอที่ใช่',2),
('20000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000001','PRODUCT — ลงมือสร้างและเปิดตัว',3) on conflict do nothing;
insert into public.lessons(id,module_id,title,description,youtube_url,youtube_video_id,position,duration_minutes,is_preview)
select ('30000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,
('20000000-0000-4000-8000-'||lpad((((n-1)/3)+1)::text,12,'0'))::uuid,
(array['Welcome','OMB Overview','Your Business Model','Find Your Market','Find The Pain','Build Your Offer','Product Strategy','Build Your Product','Launch'])[n],
'บทเรียนตัวอย่าง — กรุณาเปลี่ยนวิดีโอและคำอธิบายเป็นเนื้อหาจริงก่อนเปิดรับผู้เรียน',
'https://www.youtube.com/watch?v=jNQXAC9IVRw','jNQXAC9IVRw',((n-1)%3)+1,15,n=1
from generate_series(1,9) as n on conflict do nothing;
commit;
