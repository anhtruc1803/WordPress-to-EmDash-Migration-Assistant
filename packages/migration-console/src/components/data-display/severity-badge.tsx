import { cn } from "@console/lib/utils";
import { type UISeverity, SEVERITY_LABELS } from "@console/lib/types";
import { AlertTriangle, Info, AlertCircle, ShieldAlert } from "lucide-react";

const severityConfig: Record<UISeverity, { icon: typeof Info; className: string; bgClassName: string }> = {
  info: {
    icon: Info,
    className: "text-severity-info",
    bgClassName: "bg-severity-info/10 text-severity-info border-severity-info/20",
  },
  low: {
    icon: ShieldAlert,
    className: "text-severity-low",
    bgClassName: "bg-severity-low/10 text-severity-low border-severity-low/20",
  },
  medium: {
    icon: AlertTriangle,
    className: "text-severity-medium",
    bgClassName: "bg-severity-medium/10 text-severity-medium border-severity-medium/20",
  },
  high: {
    icon: AlertCircle,
    className: "text-severity-high",
    bgClassName: "bg-severity-high/10 text-severity-high border-severity-high/20",
  },
};

interface SeverityBadgeProps {
  severity: UISeverity;
  showIcon?: boolean;
  className?: string;
}

export function SeverityBadge({ severity, showIcon = true, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold",
        config.bgClassName,
        className
      )}
      role="status"
      aria-label={`Severity: ${SEVERITY_LABELS[severity]}`}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {SEVERITY_LABELS[severity]}
    </span>
  );
}
