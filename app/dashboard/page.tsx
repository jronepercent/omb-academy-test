import { learningData } from "@/lib/data";
import { Shell } from "@/components/shell";
import { Dashboard } from "@/components/learning";
export default async function DashboardPage() {
  const { courses, progress, profile } = await learningData();
  return (
    <Shell
      name={profile.full_name || "ผู้เรียน"}
      admin={profile.role === "admin"}
    >
      <Dashboard
        courses={courses}
        progress={progress}
        name={profile.full_name || "ผู้เรียน"}
      />
    </Shell>
  );
}
