import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "OMB Academy — เรียนรู้ สร้าง ลงมือทำ",
    template: "%s · OMB Academy",
  },
  description: "พื้นที่เรียนรู้สำหรับคนที่อยากสร้างธุรกิจด้วยตัวเอง",
  robots: { index: false, follow: false },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
