import Link from "next/link";
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  Play,
  Settings,
  ShieldCheck,
} from "lucide-react";
export function Brand() {
  return (
    <span className="brand">
      <span className="brand-icon">
        <Play size={17} fill="currentColor" />
      </span>
      <span>
        OMB<span className="brand-light"> ACADEMY</span>
      </span>
      <span className="beta">BETA</span>
    </span>
  );
}
export function Shell({
  children,
  name = "ผู้เรียน",
  admin = false,
  demo = false,
  active = "dashboard",
}: {
  children: React.ReactNode;
  name?: string;
  admin?: boolean;
  demo?: boolean;
  active?: string;
}) {
  const home = demo ? "/demo" : "/dashboard";
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link href={home} aria-label="OMB Academy">
          <Brand />
        </Link>
        <div className="nav-label">YOUR WORKSPACE</div>
        <nav>
          <Link className={active === "dashboard" ? "active" : ""} href={home}>
            <LayoutDashboard size={19} />
            ภาพรวมการเรียน
          </Link>
          <Link
            className={active === "course" ? "active" : ""}
            href={demo ? "/demo/course" : home + "#courses"}
          >
            <BookOpen size={19} />
            คอร์สของฉัน
          </Link>
          {!demo && (
            <Link
              className={active === "account" ? "active" : ""}
              href="/account"
            >
              <Settings size={19} />
              บัญชีของฉัน
            </Link>
          )}
          {admin && (
            <Link className={active === "admin" ? "active" : ""} href="/admin">
              <ShieldCheck size={19} />
              จัดการระบบ
            </Link>
          )}
        </nav>
        <div className="sidebar-bottom">
          <div className="small muted">
            สร้างธุรกิจในแบบของคุณ
            <br />
            ทีละบทเรียน ทีละก้าว
          </div>
          <div className="profile">
            <span className="avatar">{name.slice(0, 1)}</span>
            <div>
              <strong>{name}</strong>
              <div className="small muted">
                {demo ? "บัญชีทดลอง" : admin ? "ผู้ดูแลระบบ" : "สมาชิก Academy"}
              </div>
            </div>
            {demo ? (
              <Link href="/" aria-label="ออกจากหน้าทดลอง">
                <LogOut size={18} />
              </Link>
            ) : (
              <form action="/auth/logout" method="post">
                <button className="icon-button" aria-label="ออกจากระบบ">
                  <LogOut size={18} />
                </button>
              </form>
            )}
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span className="muted">พื้นที่การเรียนรู้ของคุณ</span>
          <span className="topbar-right">
            {demo ? (
              <span className="demo-pill">โหมดทดลอง</span>
            ) : (
              <span className="small">LEARN. BUILD. GROW.</span>
            )}
            <span className="avatar small-avatar">{name.slice(0, 1)}</span>
          </span>
        </header>
        {demo && (
          <div className="demo-banner">
            BETA PREVIEW · คอร์สและวิดีโอตัวอย่าง
            ความคืบหน้าเก็บในเบราว์เซอร์นี้เท่านั้น
          </div>
        )}
        {children}
        <footer>
          © {new Date().getFullYear()} OMB ACADEMY{" "}
          <span>พื้นที่เล็ก ๆ สำหรับการเติบโตครั้งใหญ่</span>
        </footer>
      </div>
    </div>
  );
}
