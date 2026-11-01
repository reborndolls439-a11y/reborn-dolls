import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold font-body transition-colors",
  {
    variants: {
      variant: {
        new: "bg-sage-100 text-sage-600 border border-sage-200",
        featured: "bg-bloom-rose-50 text-bloom-rose-600 border border-bloom-rose-200",
        sale: "bg-red-50 text-red-600 border border-red-200",
        limited: "bg-amber-50 text-amber-700 border border-amber-200",
        "sold-out": "bg-charcoal-100 text-charcoal-500 border border-charcoal-200",
        default: "bg-charcoal-100 text-charcoal-600",
        success: "bg-green-50 text-green-700 border border-green-200",
        warning: "bg-amber-50 text-amber-700 border border-amber-200",
        error: "bg-red-50 text-red-600 border border-red-200",
        info: "bg-blue-50 text-blue-600 border border-blue-200",
        outline: "border border-charcoal-200 text-charcoal-600 bg-transparent",
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
