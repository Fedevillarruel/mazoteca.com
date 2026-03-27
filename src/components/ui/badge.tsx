import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-surface-800 text-surface-200 border border-surface-700",
        primary: "bg-primary-500/15 text-primary-300 border border-primary-500/20",
        accent: "bg-accent-500/15 text-accent-300 border border-accent-500/20",
        success: "bg-success/15 text-success border border-success/20",
        warning: "bg-warning/15 text-warning border border-warning/20",
        error: "bg-error/15 text-error border border-error/20",
        info: "bg-info/15 text-info border border-info/20",
        // Rarity badges
        common: "bg-surface-700 text-surface-300",
        uncommon: "bg-green-900/40 text-green-400 border border-green-500/20",
        rare: "bg-blue-900/40 text-blue-400 border border-blue-500/20",
        epic: "bg-purple-900/40 text-purple-400 border border-purple-500/20",
        legendary: "bg-amber-900/40 text-amber-400 border border-amber-500/20",
        mythic: "bg-red-900/40 text-red-400 border border-red-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
