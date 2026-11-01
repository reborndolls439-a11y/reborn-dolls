import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../lib/utils";
import { Skeleton } from "./Skeleton";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  trendLabel?: string;
  loading?: boolean;
  className?: string;
  accent?: "rose" | "sage" | "taupe" | "charcoal";
}

const accentClasses = {
  rose: "bg-bloom-rose-50 text-bloom-rose",
  sage: "bg-sage-50 text-sage-500",
  taupe: "bg-taupe/10 text-taupe",
  charcoal: "bg-charcoal-100 text-charcoal-600",
};

export function StatCard({
  title,
  value,
  icon,
  trend,
  trendLabel,
  loading = false,
  className,
  accent = "rose",
}: StatCardProps) {
  if (loading) {
    return (
      <div className={cn("bg-white rounded-2xl p-6 border border-charcoal-100", className)}>
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton variant="text" width={60} height={20} />
        </div>
        <Skeleton variant="text" width={120} height={28} className="mb-1.5" />
        <Skeleton variant="text" width={80} height={14} />
      </div>
    );
  }

  const TrendIcon =
    trend === undefined ? null :
    trend > 0 ? TrendingUp :
    trend < 0 ? TrendingDown : Minus;

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-6 border border-charcoal-100 hover:shadow-card transition-shadow duration-200",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center", accentClasses[accent])}>
            {React.isValidElement(icon)
              ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-5 h-5" })
              : icon}
          </div>
        )}
        {trend !== undefined && TrendIcon && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            trend > 0 ? "text-green-600 bg-green-50" :
            trend < 0 ? "text-red-600 bg-red-50" :
            "text-taupe bg-charcoal-50"
          )}>
            <TrendIcon className="w-3 h-3" />
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-charcoal font-heading">{value}</p>
      <p className="mt-1 text-sm text-taupe font-body">{title}</p>
      {trendLabel && (
        <p className="mt-0.5 text-xs text-taupe-400 font-body">{trendLabel}</p>
      )}
    </div>
  );
}
