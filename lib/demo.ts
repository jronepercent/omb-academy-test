import type { Course } from "./types";
export const demoCourse: Course = {
  id: "demo-course",
  title: "ONE MAN BUSINESS",
  slug: "one-man-business",
  description:
    "เปลี่ยนความรู้และทักษะของคุณให้กลายเป็นธุรกิจออนไลน์ที่คุณสามารถบริหารได้ด้วยตัวเอง ตั้งแต่ค้นหาจุดแข็ง สร้างข้อเสนอ ไปจนถึงเปิดตัวสินค้าชิ้นแรก",
  thumbnail_url: "",
  status: "published",
  modules: [
    {
      id: "start",
      course_id: "demo-course",
      title: "START — วางรากฐานธุรกิจ",
      position: 1,
      lessons: ["Welcome", "OMB Overview", "Your Business Model"].map(
        (title, i) => ({
          id: `start-${i}`,
          module_id: "start",
          title,
          description: [
            "ยินดีต้อนรับสู่ ONE MAN BUSINESS เริ่มต้นจากสิ่งที่คุณรู้ แล้วเปลี่ยนให้เป็นสิ่งที่คนอื่นต้องการ หลังเรียนจบ ลองเขียนทักษะ 3 อย่างที่คุณอยากแบ่งปัน",
            "มองภาพรวมของธุรกิจคนเดียว และออกแบบวิธีทำงานให้เหมาะกับชีวิตของคุณ",
            "เลือกโมเดลธุรกิจที่เหมาะกับทักษะ เวลา และเป้าหมายของคุณ",
          ][i],
          youtube_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
          youtube_video_id: "jNQXAC9IVRw",
          position: i + 1,
          duration_minutes: [8, 12, 18][i],
          is_preview: i === 0,
        }),
      ),
    },
    ...["OFFER — สร้างข้อเสนอที่ใช่", "PRODUCT — ลงมือสร้างและเปิดตัว"].map(
      (title, k) => ({
        id: `module-${k}`,
        course_id: "demo-course",
        title,
        position: k + 2,
        lessons: (k === 0
          ? ["Find Your Market", "Find The Pain", "Build Your Offer"]
          : ["Product Strategy", "Build Your Product", "Launch"]
        ).map((name, i) => ({
          id: `lesson-${k}-${i}`,
          module_id: `module-${k}`,
          title: name,
          description:
            "เรียนรู้แนวคิด แล้วลงมือทำทีละขั้น ลองนำสิ่งที่เรียนไปปรับใช้กับธุรกิจของคุณก่อนเริ่มบทเรียนถัดไป",
          youtube_url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
          youtube_video_id: "jNQXAC9IVRw",
          position: i + 1,
          duration_minutes: 15 + i * 3,
          is_preview: false,
        })),
      }),
    ),
  ],
};
