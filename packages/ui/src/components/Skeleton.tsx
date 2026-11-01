import * as React from "react";
import { cn } from "../lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rect" | "circle";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "rect",
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "bg-charcoal-100 animate-skeleton",
        variant === "circle" && "rounded-full",
        variant === "rect" && "rounded-xl",
        variant === "text" && "rounded-md",
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      aria-hidden="true"
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-3xl overflow-hidden border border-charcoal-100">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton variant="text" height={12} width="40%" />
        <Skeleton variant="text" height={16} />
        <Skeleton variant="text" height={16} width="80%" />
        <Skeleton variant="text" height={20} width="35%" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton variant="text" height={14} width={i === 0 ? "60%" : "80%"} />
        </td>
      ))}
    </tr>
  );
}
