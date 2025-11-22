import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type TrendVariant = "positive" | "negative" | "neutral";

const trendVariantStyles: Record<TrendVariant, string> = {
  positive: "bg-emerald-50 text-emerald-600",
  negative: "bg-rose-50 text-rose-600",
  neutral: "bg-primary-50 text-primary-700",
};

export type InstructorStatsCardProps = React.HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: React.ReactNode;
  helperText?: React.ReactNode;
  icon?: LucideIcon;
  isLoading?: boolean;
  iconClassName?: string;
  valueClassName?: string;
  trend?: {
    label: string;
    variant?: TrendVariant;
  };
};

export const InstructorStatsCard = React.forwardRef<
  HTMLDivElement,
  InstructorStatsCardProps
>(function InstructorStatsCard(
  {
    label,
    value,
    helperText,
    icon: Icon,
    isLoading,
    className,
    iconClassName,
    valueClassName,
    trend,
    ...props
  },
  ref
) {
  return (
    <Card
      ref={ref}
      className={cn("invitation-stat-card", className)}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-primary-700">{label}</p>
        {Icon ? (
          <div className="invitation-stat-icon">
            <Icon
              className={cn("h-5 w-5 text-primary-700", iconClassName)}
              aria-hidden="true"
            />
          </div>
        ) : null}
      </div>
      <div className="space-y-3">
        <div
          className={cn(
            "text-4xl font-semibold tracking-tight text-gray-900",
            valueClassName
          )}
        >
          {isLoading ? "…" : value}
        </div>
        {trend || helperText ? (
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {trend ? (
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
                  trendVariantStyles[trend.variant ?? "neutral"]
                )}
              >
                {trend.label}
              </span>
            ) : null}
            {helperText ? (
              <span className="leading-snug">{helperText}</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Card>
  );
});

