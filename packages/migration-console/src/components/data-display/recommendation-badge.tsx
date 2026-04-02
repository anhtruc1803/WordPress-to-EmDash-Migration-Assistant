import { cn } from "@console/lib/utils";
import { type RecommendationKind, RECOMMENDATION_LABELS } from "@console/lib/types";
import { CheckCircle2, Wrench, RotateCcw } from "lucide-react";

const recommendationConfig: Record<RecommendationKind, { icon: typeof CheckCircle2; className: string }> = {
  "ready-for-import": {
    icon: CheckCircle2,
    className: "bg-severity-low/10 text-severity-low border-severity-low/20",
  },
  "import-with-manual-cleanup": {
    icon: Wrench,
    className: "bg-severity-medium/10 text-severity-medium border-severity-medium/20",
  },
  "rebuild-recommended": {
    icon: RotateCcw,
    className: "bg-severity-high/10 text-severity-high border-severity-high/20",
  },
};

interface RecommendationBadgeProps {
  recommendation: RecommendationKind;
  showIcon?: boolean;
  className?: string;
}

export function RecommendationBadge({ recommendation, showIcon = true, className }: RecommendationBadgeProps) {
  const config = recommendationConfig[recommendation];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-3 w-3" />}
      {RECOMMENDATION_LABELS[recommendation]}
    </span>
  );
}
