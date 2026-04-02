"use client";

import { use } from "react";
import { useProject } from "@console/hooks/use-migration";
import { PageHeader } from "@console/components/layout/page-header";
import { SectionHeader } from "@console/components/layout/page-header";
import { SeverityBadge } from "@console/components/data-display/severity-badge";
import { StatCard } from "@console/components/data-display/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@console/components/ui/card";
import { Badge } from "@console/components/ui/badge";
import { LoadingState, ErrorState, EmptyState } from "@console/components/data-display/states";
import {
  Eye, FolderOpen, FileImage, ArrowRight, CheckCircle2, XCircle, AlertTriangle, Lightbulb
} from "lucide-react";
import { mapSeverity } from "@console/lib/types";
import { cn } from "@console/lib/utils";

export default function ImportPlanPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { data: project, isLoading, error } = useProject(projectId);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!project) return null;

  const plan = project.latestPlan;

  if (!plan) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Import Plan" />
        <EmptyState
          icon={Eye}
          title="No import plan"
          description="Run an audit to generate an import plan."
        />
      </div>
    );
  }

  const readyCount = plan.entries.filter((e) => e.status === "ready").length;
  const reviewCount = plan.entries.filter((e) => e.status === "manual-review").length;
  const blockedCount = plan.entries.filter((e) => e.status === "blocked").length;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Import Plan"
        description="Content mapping and migration readiness"
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Entries" value={plan.entries.length} icon={FolderOpen} />
        <StatCard label="Ready" value={readyCount} icon={CheckCircle2} />
        <StatCard label="Manual Review" value={reviewCount} icon={AlertTriangle} />
        <StatCard label="Blocked" value={blockedCount} icon={XCircle} />
      </div>

      {/* Target Collections */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Target Collections</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(plan.targetCollections).map(([name, info]) => (
              <div key={name} className="p-3 rounded-lg border bg-muted/30">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{name}</p>
                  <Badge variant="secondary">{info.count}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Content type: {info.contentType}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Title</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Type</th>
                  <th className="text-left py-2 px-4 font-medium text-muted-foreground">Target</th>
                  <th className="text-center py-2 pl-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {plan.entries.slice(0, 50).map((entry) => (
                  <tr key={entry.itemId} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-2 pr-4">
                      <p className="text-sm font-medium truncate max-w-xs">{entry.title || entry.slug}</p>
                      <code className="text-[10px] text-muted-foreground">{entry.itemId}</code>
                    </td>
                    <td className="py-2 px-4 text-xs text-muted-foreground">{entry.sourcePostType}</td>
                    <td className="py-2 px-4">
                      <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{entry.targetCollection}</code>
                    </td>
                    <td className="py-2 pl-4 text-center">
                      <Badge
                        variant={
                          entry.status === "ready" ? "default" :
                          entry.status === "blocked" ? "destructive" : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {entry.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Media Imports */}
      {plan.mediaImports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Media Imports ({plan.mediaImports.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto scrollbar-thin">
              {plan.mediaImports.slice(0, 20).map((media) => (
                <div key={media.mediaId} className="flex items-center gap-2 p-2 rounded border text-xs">
                  <FileImage className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{media.fileName}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rewrite Suggestions */}
      {plan.rewriteSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">URL Rewrite Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 max-h-48 overflow-y-auto scrollbar-thin">
              {plan.rewriteSuggestions.slice(0, 20).map((rw, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono">
                  <code className="bg-muted px-1.5 py-0.5 rounded truncate max-w-[200px]">{rw.from}</code>
                  <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                  <code className="bg-muted px-1.5 py-0.5 rounded truncate max-w-[200px]">{rw.to}</code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assumptions */}
      {plan.assumptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Assumptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.assumptions.map((assumption, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="mt-1 text-muted-foreground/60">•</span>
                  {assumption}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
