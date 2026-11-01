import * as React from "react";
import { cn } from "../lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  size = "md",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        size === "sm" && "py-8 px-4",
        size === "md" && "py-16 px-6",
        size === "lg" && "py-24 px-8",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-taupe-300">
          {React.isValidElement(icon)
            ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                className: cn(
                  "mx-auto",
                  size === "sm" ? "w-10 h-10" : size === "md" ? "w-16 h-16" : "w-20 h-20"
                ),
              })
            : icon}
        </div>
      )}
      <h3
        className={cn(
          "font-semibold text-charcoal font-heading",
          size === "sm" && "text-base",
          size === "md" && "text-xl",
          size === "lg" && "text-2xl"
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "mt-2 text-taupe font-body max-w-sm",
            size === "sm" && "text-sm",
            size === "md" && "text-base",
            size === "lg" && "text-lg"
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
