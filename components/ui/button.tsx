import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
export function Button({
  className,
  asChild = false,
  variant = "primary",
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn("button", variant, className)} {...props} />;
}
