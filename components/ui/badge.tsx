import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-sm border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]",
  {
    variants: {
      variant: {
        ready: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
        pending: "border-amber-300/30 bg-amber-300/10 text-amber-200",
        neutral: "border-slate-600 bg-slate-800 text-slate-300",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
