import Link from "next/link";
export default function NotFound() {
  return (
    <main className="auth-wrap">
      <div>
        <p className="eyebrow">404 / NOT FOUND</p>
        <h1>ไม่พบหน้านี้</h1>
        <p className="muted">
          คอร์สอาจยังไม่เผยแพร่ หรือคุณยังไม่มีสิทธิ์เข้าถึง
        </p>
        <Link className="button primary" href="/dashboard">
          กลับหน้าคอร์สของฉัน
        </Link>
      </div>
    </main>
  );
}
