import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur-xl", className)} {...props} />;
}
