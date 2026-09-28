import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function youtubeId(input: string): string | null {
  try {
    const u = new URL(input);
    if (!["https:", "http:"].includes(u.protocol)) return null;
    const host = u.hostname.toLowerCase().replace(/^www\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.split("/")[1];
    if (["youtube.com", "m.youtube.com"].includes(host))
      id =
        u.pathname === "/watch"
          ? u.searchParams.get("v")
          : /^\/(embed|shorts)\//.test(u.pathname)
            ? u.pathname.split("/")[2]
            : null;
    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
