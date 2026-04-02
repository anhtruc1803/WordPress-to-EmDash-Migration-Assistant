"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useProject, useRunAudit } from "@console/hooks/use-migration";
import { PageHeader } from "@console/components/layout/page-header";
import { SectionHeader } from "@console/components/layout/page-header";
import { StatCard } from "@console/components/data-display/stat-card";
import { SeverityBadge } from "@console/components/data-display/severity-badge";
import { RecommendationBadge } from "@console/components/data-display/recommendation-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@console/components/ui/card";
import { LoadingState, ErrorState, EmptyState } from "@console/components/data-display/states";
import {
  PlayCircle, Download, Loader2, BarChart3, Blocks, Hash,
  AlertTriangle, CheckCircle2, XCircle, FileText,
} from "lucide-react";
import { mapSeverity } from "@console/lib/types";
import type { RecommendationKind } from "@console/lib/types";

export default function AuditResultsPage({
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

  if (!audit) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Audit Results" />
        <EmptyState
          icon={BarChart3}
          title="No audit results"
          description="Run an audit to analyze your WordPress content."
          action={{
            label: "Run Audit",
            onClick: () => auditMutation.mutate(),
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Audit Results"
        description="Content analysis and migration risk assessment"
        badge={<RecommendationBadge recommendation={audit.recommendation as RecommendationKind} />}
        actions={[
          {
            label: "Export Report",
            icon: Download,
            onClick: () => {},
            variant: "outline",
          },
          {
            label: auditMutation.isPending ? "Running..." : "Re-run Audit",
            icon: auditMutation.isPending ? Loader2 : PlayCircle,
            onClick: () => auditMutation.mutate(),
            disabled: auditMutation.isPending,
          },
        ]}
      />

      {/* Executive Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Difficulty" value={audit.difficulty} icon={BarChart3} />
        <StatCard
          label="Supported Blocks"
          value={audit.summary.supportedBlockCount}
          icon={CheckCircle2}
        />
        <StatCard
          label="Unsupported Blocks"
          value={audit.summary.unsupportedBlockCount}
          icon={XCircle}
        />
        <StatCard
          label="Shortcodes Found"
          value={audit.summary.totalShortcodes}
          icon={Hash}
        />
      </div>

      {/* Content Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Content Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {Object.entries(audit.counts).map(([key, value]) => (
              <div key={key} className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground capitalize">
                  {key.replace(/([A-Z])/g, " $1").replace("postType:", "")}
                </p>
                <p className="text-xl font-bold mt-1">{value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Block Inventory */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Block Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Block Name</th>
                  <th className="text-right py-2 px-4 font-medium text-muted-foreground">Count</th>
                  <th className="text-center py-2 pl-4 font-medium text-muted-foreground">Supported</th>
                </tr>
              </thead>
              <tbody>
                {audit.blockInventory.map((block) => (
                  <tr key={block.blockName} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2 pr-4">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{block.blockName}</code>
                    </td>
                    <td className="text-right py-2 px-4 font-medium">{block.count}</td>
                    <td className="text-center py-2 pl-4">
                      {block.supported ? (
                        <CheckCircle2 className="h-4 w-4 text-severity-low inline" />
                      ) : (
                        <XCircle className="h-4 w-4 text-severity-high inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Shortcode Inventory */}
      {audit.shortcodeInventory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Shortcode Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Shortcode</th>
                    <th className="text-right py-2 pl-4 font-medium text-muted-foreground">Count</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.shortcodeInventory.map((sc) => (
                    <tr key={sc.shortcode} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="py-2 pr-4">
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">[{sc.shortcode}]</code>
                      </td>
                      <td className="text-right py-2 pl-4 font-medium">{sc.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Builder & Plugin Hints */}
      {(audit.builderHints.length > 0 || audit.pluginHints.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Builder & Plugin Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...audit.builderHints, ...audit.pluginHints].map((hint) => (
                <div
                  key={hint.name}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="text-sm font-medium">{hint.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Signals: {hint.matchedSignals.join(", ")}
                    </p>
                  </div>
                  <span className="text-sm font-mono font-medium">
                    {Math.round(hint.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Key Findings ({audit.findings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin">
            {audit.findings.slice(0, 50).map((finding) => (
              <div
                key={finding.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <SeverityBadge severity={mapSeverity(finding.severity)} showIcon={true} />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{finding.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{finding.detail}</p>
                  {finding.itemId && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Item: <code className="bg-muted px-1 rounded">{finding.itemId}</code>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
