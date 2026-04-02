"use client";

import { use, useState, useMemo } from "react";
import { useProject } from "@console/hooks/use-migration";
import { PageHeader } from "@console/components/layout/page-header";
import { SeverityBadge } from "@console/components/data-display/severity-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@console/components/ui/card";
import { Input } from "@console/components/ui/input";
import { Badge } from "@console/components/ui/badge";
import { Button } from "@console/components/ui/button";
import { LoadingState, ErrorState, EmptyState } from "@console/components/data-display/states";
import { AlertTriangle, Search, Filter, ChevronDown, ChevronRight } from "lucide-react";
import { mapSeverity, type UISeverity } from "@console/lib/types";
import { cn } from "@console/lib/utils";

export default function ManualFixesPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const { data: project, isLoading, error } = useProject(projectId);

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<UISeverity | "all">("all");
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  const plan = project?.latestPlan;
  const unresolvedItems = plan?.unresolvedItems ?? [];

  const filteredItems = useMemo(() => {
    return unresolvedItems.filter((item) => {
      const matchesSearch =
        !search ||
        item.itemId.toLowerCase().includes(search.toLowerCase()) ||
        item.reason.toLowerCase().includes(search.toLowerCase()) ||
        item.suggestedAction.toLowerCase().includes(search.toLowerCase()) ||
        item.details.some((d) => d.toLowerCase().includes(search.toLowerCase()));

      const matchesSeverity =
        severityFilter === "all" || mapSeverity(item.severity) === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [unresolvedItems, search, severityFilter]);

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!project) return null;

  if (!plan || unresolvedItems.length === 0) {
    return (
      <div className="animate-fade-in">
        <PageHeader title="Manual Fixes" />
        <EmptyState
          icon={AlertTriangle}
          title="No manual fixes needed"
          description={
            plan
              ? "All items can be imported without manual intervention."
              : "Run an audit to identify items that need manual fixes."
          }
        />
      </div>
    );
  }

  const severityCounts = {
    all: unresolvedItems.length,
    high: unresolvedItems.filter((i) => mapSeverity(i.severity) === "high").length,
    medium: unresolvedItems.filter((i) => mapSeverity(i.severity) === "medium").length,
    info: unresolvedItems.filter((i) => mapSeverity(i.severity) === "info").length,
  };

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Manual Fixes"
        description={`${unresolvedItems.length} items require manual review`}
      />

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, reason, or details..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              {(["all", "high", "medium", "info"] as const).map((severity) => (
                <Button
                  key={severity}
                  variant={severityFilter === severity ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSeverityFilter(severity)}
                >
                  {severity === "all" ? "All" : <SeverityBadge severity={severity} showIcon={false} />}
                  <span className="ml-1 text-xs">({severityCounts[severity] ?? 0})</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredItems.length} of {unresolvedItems.length} items
      </p>

      {/* Items List */}
      <div className="space-y-2">
        {filteredItems.map((item) => {
          const isExpanded = expandedItem === item.itemId;
          return (
            <Card key={item.itemId} className="overflow-hidden">
              <button
                className="w-full text-left p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedItem(isExpanded ? null : item.itemId)}
              >
                <div className="mt-0.5">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <SeverityBadge severity={mapSeverity(item.severity)} />
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{item.itemId}</code>
                  </div>
                  <p className="text-sm mt-1.5">{item.reason}</p>
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pl-11 border-t bg-muted/30 animate-fade-in">
                  <div className="pt-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Suggested Action
                      </p>
                      <p className="text-sm">{item.suggestedAction}</p>
                    </div>

                    {item.details.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                          Details
                        </p>
                        <ul className="space-y-1">
                          {item.details.map((detail, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                              <span className="text-muted-foreground/60 mt-0.5">•</span>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(item.warningIds.length > 0 || item.findingIds.length > 0) && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                          Related IDs
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {[...item.warningIds, ...item.findingIds].map((id) => (
                            <Badge key={id} variant="outline" className="text-[10px]">
                              {id}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
