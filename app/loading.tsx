export default function Loading() {
  return (
    <main className="page">
      <div className="skeleton" style={{ height: 40, width: "45%" }} />
      <div className="skeleton" style={{ height: 320, marginTop: 32 }} />
      <p className="muted">กำลังโหลด...</p>
    </main>
  );
}
