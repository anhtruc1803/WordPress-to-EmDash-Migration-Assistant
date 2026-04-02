import { cn } from "@console/lib/utils";
import { type ProjectStatus, PROJECT_STATUS_LABELS } from "@console/lib/types";
import {
  FileText, Link, ClipboardCheck, Play, CheckCircle2, XCircle,
} from "lucide-react";

const statusConfig: Record<ProjectStatus, { icon: typeof FileText; className: string }> = {
  draft: {
    icon: FileText,
    className: "bg-status-draft/10 text-status-draft border-status-draft/20",
  },
  "source-connected": {
    icon: Link,
    className: "bg-status-connected/10 text-status-connected border-status-connected/20",
  },
  audited: {
    icon: ClipboardCheck,
    className: "bg-status-audited/10 text-status-audited border-status-audited/20",
  },
  "dry-run-complete": {
    icon: Play,
    className: "bg-status-dry-run/10 text-status-dry-run border-status-dry-run/20",
  },
  "ready-for-import": {
    icon: CheckCircle2,
    className: "bg-status-ready/10 text-status-ready border-status-ready/20",
  },
  blocked: {
    icon: XCircle,
    className: "bg-status-blocked/10 text-status-blocked border-status-blocked/20",
  },
};

interface StatusBadgeProps {
  status: ProjectStatus;
  showIcon?: boolean;
  className?: string;
}

export function StatusBadge({ status, showIcon = true, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
      role="status"
      aria-label={`Status: ${PROJECT_STATUS_LABELS[status]}`}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}
