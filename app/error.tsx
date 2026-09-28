"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="auth-wrap">
      <div className="panel">
        <h1>โหลดข้อมูลไม่สำเร็จ</h1>
        <p className="muted">กรุณาลองอีกครั้ง หากยังพบปัญหาให้ติดต่อผู้ดูแล</p>
        <Button onClick={reset}>ลองอีกครั้ง</Button>
      </div>
    </main>
  );
}
