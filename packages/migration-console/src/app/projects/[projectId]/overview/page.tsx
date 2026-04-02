"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useProject, useRunAudit } from "@console/hooks/use-migration";
import { PageHeader } from "@console/components/layout/page-header";
import { StatCard } from "@console/components/data-display/stat-card";
import { StatusBadge } from "@console/components/data-display/status-badge";
import { SeverityBadge } from "@console/components/data-display/severity-badge";
import { RecommendationBadge } from "@console/components/data-display/recommendation-badge";
import { KeyValueList } from "@console/components/data-display/key-value-list";
import { Card, CardContent, CardHeader, CardTitle } from "@console/components/ui/card";
import { Button } from "@console/components/ui/button";
import { LoadingState, ErrorState, EmptyState } from "@console/components/data-display/states";
import {
  PlayCircle, ClipboardList, AlertTriangle, ArrowRightLeft,
  Eye, Loader2, BarChart3, FileWarning, Blocks, FileText,
} from "lucide-react";
import { mapSeverity } from "@console/lib/types";
import type { RecommendationKind } from "@console/lib/types";

export default function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const router = useRouter();
  const { data: project, isLoading, error } = useProject(projectId);
  const auditMutation = useRunAudit(projectId);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!project) return null;

  const audit = project.latestAudit;
  const transform = project.latestTransform;
  const plan = project.latestPlan;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={project.name}
        badge={<StatusBadge status={project.status} />}
        actions={[
          {
            label: auditMutation.isPending ? "Running..." : "Run Audit",
            icon: auditMutation.isPending ? Loader2 : PlayCircle,
            onClick: () => auditMutation.mutate(),
            variant: "default",
            disabled: auditMutation.isPending,
          },
        ]}
      />

      {/* Quick Stats */}
      {audit ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Difficulty"
              value={audit.difficulty}
              icon={BarChart3}
              onClick={() => router.push(`/projects/${projectId}/audit`)}
            />
            <StatCard
              label="Content Items"
              value={audit.counts.totalContentItems ?? 0}
              icon={FileText}
              description={`${audit.counts.posts ?? 0} posts, ${audit.counts.pages ?? 0} pages`}
            />
            <StatCard
              label="Warnings"
              value={transform?.warnings.length ?? 0}
              icon={FileWarning}
              onClick={() => router.push(`/projects/${projectId}/manual-fixes`)}
            />
            <StatCard
              label="Unresolved Items"
              value={plan?.unresolvedItems.length ?? 0}
              icon={AlertTriangle}
              onClick={() => router.push(`/projects/${projectId}/manual-fixes`)}
            />
          </div>

          {/* Recommendation + Source Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Audit Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Recommendation:</span>
                  <RecommendationBadge recommendation={audit.recommendation as RecommendationKind} />
                </div>
                <KeyValueList
                  items={[
                    { label: "Supported Blocks", value: audit.summary.supportedBlockCount },
                    { label: "Unsupported Blocks", value: audit.summary.unsupportedBlockCount },
                    { label: "Shortcodes", value: audit.summary.totalShortcodes },
                    { label: "Items with Warnings", value: audit.summary.totalItemsWithWarnings },
                  ]}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Source Info</CardTitle>
              </CardHeader>
              <CardContent>
                <KeyValueList
                  items={[
                    { label: "Type", value: project.source.kind.toUpperCase() },
                    { label: "Location", value: project.source.location },
                    {
                      label: "Validated",
                      value: project.source.validated ? "Yes" : "No",
                    },
                    ...(project.latestBundle?.site
                      ? [
                          { label: "Site Title", value: project.latestBundle.site.title },
                          ...(project.latestBundle.site.language
                            ? [{ label: "Language", value: project.latestBundle.site.language }]
                            : []),
                        ]
                      : []),
                  ]}
                />
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: "Audit Results", href: "audit", icon: ClipboardList },
                  { label: "Manual Fixes", href: "manual-fixes", icon: AlertTriangle },
                  { label: "Transform Preview", href: "transform-preview", icon: ArrowRightLeft },
                  { label: "Import Plan", href: "import-plan", icon: Eye },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={`/projects/${projectId}/${link.href}`}
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
                  >
                    <link.icon className="h-4 w-4 text-muted-foreground" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <EmptyState
          icon={ClipboardList}
          title="No audit results yet"
          description="Run an audit to analyze your WordPress content and get migration recommendations."
          action={{
            label: "Run Audit",
            onClick: () => auditMutation.mutate(),
          }}
        />
      )}
    </div>
  );
}
