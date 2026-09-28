import { Demo } from "@/components/demo";
import { notFound } from "next/navigation";
export default async function DemoPage({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;
  if (!path.length) return <Demo />;
  if (path[0] === "course" && path.length === 1) return <Demo view="course" />;
  if (path[0] === "lesson" && path.length === 2)
    return <Demo view="lesson" lessonId={path[1]} />;
  notFound();
}
