"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useProject, useRunDryRun } from "@console/hooks/use-migration";
import { PageHeader } from "@console/components/layout/page-header";
import { StatCard } from "@console/components/data-display/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@console/components/ui/card";
import { Button } from "@console/components/ui/button";
import { LoadingState, ErrorState, EmptyState } from "@console/components/data-display/states";
import {
  PlayCircle, Loader2, CheckCircle2, XCircle, AlertTriangle,
  ArrowRightLeft, Eye, FileWarning,
} from "lucide-react";

export default function DryRunPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();
  const { data: project, isLoading, error } = useProject(projectId);
  const dryRunMutation = useRunDryRun(projectId);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!project) return null;

  const transform = project.latestTransform;

  if (!transform) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Dry Run" />
        <EmptyState
          icon={PlayCircle}
          title="No dry run results"
          description="Run a dry run to preview how your content will be transformed."
          action={{
            label: "Run Dry Run",
            onClick: () => dryRunMutation.mutate(),
          }}
        />
      </div>
    );
  }

  const successCount = transform.items.filter(
    (item) => item.unsupportedNodeCount === 0 && item.fallbackNodeCount === 0
  ).length;
  const fallbackCount = transform.items.filter(
    (item) => item.fallbackNodeCount > 0
  ).length;
  const unresolvedCount = transform.unsupportedNodes.length;
  const warningCount = transform.warnings.length;
  const totalItems = transform.items.length;
  const readinessPercent = totalItems > 0 ? Math.round((successCount / totalItems) * 100) : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Dry Run Results"
        description="Transform preview and migration readiness"
        actions={[
          {
            label: dryRunMutation.isPending ? "Running..." : "Re-run",
            icon: dryRunMutation.isPending ? Loader2 : PlayCircle,
            onClick: () => dryRunMutation.mutate(),
            disabled: dryRunMutation.isPending,
          },
        ]}
      />

      {/* Readiness bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Migration Readiness</span>
            <span className="text-2xl font-bold">{readinessPercent}%</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${readinessPercent}%`,
                background: readinessPercent > 80 ? "hsl(var(--severity-low))"
                  : readinessPercent > 50 ? "hsl(var(--severity-medium))"
                  : "hsl(var(--severity-high))",
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {successCount} of {totalItems} items can be imported cleanly
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Clean Transforms"
          value={successCount}
          icon={CheckCircle2}
          description="No issues"
        />
        <StatCard
          label="With Fallbacks"
          value={fallbackCount}
          icon={FileWarning}
          description="Partial conversion"
        />
        <StatCard
          label="Unresolved Nodes"
          value={unresolvedCount}
          icon={XCircle}
          description="Require manual fix"
        />
        <StatCard
          label="Warnings"
          value={warningCount}
          icon={AlertTriangle}
          description="Review recommended"
        />
      </div>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={() => router.push(`/projects/${projectId}/transform-preview`)}
            >
              <ArrowRightLeft className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">Transform Preview</p>
                <p className="text-xs text-muted-foreground">Inspect content transforms</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={() => router.push(`/projects/${projectId}/manual-fixes`)}
            >
              <AlertTriangle className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">Manual Fixes</p>
                <p className="text-xs text-muted-foreground">Review unresolved items</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 justify-start"
              onClick={() => router.push(`/projects/${projectId}/import-plan`)}
            >
              <Eye className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="text-left">
                <p className="text-sm font-medium">Import Plan</p>
                <p className="text-xs text-muted-foreground">Review target mapping</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
