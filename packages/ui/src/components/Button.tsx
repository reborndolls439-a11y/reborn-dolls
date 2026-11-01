"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium font-body transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bloom-rose-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-bloom-rose text-white hover:bg-bloom-rose-600 active:bg-bloom-rose-700 shadow-soft hover:shadow-md",
        secondary:
          "bg-soft-blush text-bloom-rose-600 hover:bg-soft-blush-200 border border-bloom-rose-200 active:bg-soft-blush-200",
        outline:
          "border border-charcoal-200 bg-transparent text-charcoal hover:bg-charcoal-50 active:bg-charcoal-100",
        ghost:
          "bg-transparent text-charcoal hover:bg-charcoal-50 active:bg-charcoal-100",
        danger:
          "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
        "danger-ghost":
          "bg-transparent text-red-500 hover:bg-red-50 active:bg-red-100",
        sage:
          "bg-sage text-white hover:bg-sage-400 active:bg-sage-500",
        white:
          "bg-white text-charcoal hover:bg-ivory-100 border border-charcoal-100 shadow-sm",
      },
      size: {
        xs: "h-7 px-3 text-xs",
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-base",
        icon: "h-10 w-10 p-0",
        "icon-sm": "h-8 w-8 p-0",
        "icon-lg": "h-12 w-12 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
