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
