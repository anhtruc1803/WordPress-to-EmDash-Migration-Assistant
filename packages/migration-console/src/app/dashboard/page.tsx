"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDashboard } from "@console/hooks/use-migration";
import { PageHeader } from "@console/components/layout/page-header";
import { StatCard } from "@console/components/data-display/stat-card";
import { StatusBadge } from "@console/components/data-display/status-badge";
import { RecommendationBadge } from "@console/components/data-display/recommendation-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@console/components/ui/card";
import { Button } from "@console/components/ui/button";
import { EmptyState, LoadingState, ErrorState } from "@console/components/data-display/states";
import {
  FolderOpen,
  FolderPlus,
  AlertTriangle,
  XCircle,
  BarChart3,
  Clock,
} from "lucide-react";
import { formatRelativeTime } from "@console/lib/utils";
import type { ProjectStatus, RecommendationKind } from "@console/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { data: stats, isLoading, error } = useDashboard();

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState message={error.message} />;
  if (!stats) return null;

  const hasProjects = stats.totalProjects > 0;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        description="Overview of all migration projects"
        actions={[
          {
            label: "New Project",
            icon: FolderPlus,
            onClick: () => router.push("/projects/new"),
            variant: "default",
          },
        ]}
      />

      {!hasProjects ? (
        <EmptyState
          icon={FolderOpen}
          title="No migration projects yet"
          description="Create your first project to start auditing and migrating WordPress content."
          action={{
            label: "Create Project",
            onClick: () => router.push("/projects/new"),
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Projects"
              value={stats.totalProjects}
              icon={FolderOpen}
            />
            <StatCard
              label="Ready for Import"
              value={stats.projectsByStatus["ready-for-import"] ?? 0}
              icon={BarChart3}
              description="Projects cleared for migration"
            />
            <StatCard
              label="Manual Fixes Open"
              value={stats.totalManualFixes}
              icon={AlertTriangle}
              description="Issues requiring attention"
            />
            <StatCard
              label="Blocked"
              value={stats.blockedProjects}
              icon={XCircle}
              description="Projects with critical issues"
            />
          </div>

          {/* Projects by Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Projects by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {(Object.entries(stats.projectsByStatus) as [ProjectStatus, number][]).map(
                  ([status, count]) => (
                    <div
                      key={status}
                      className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <StatusBadge status={status} />
                      <span className="text-2xl font-bold">{count}</span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Projects */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="text-base">Recent Projects</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/projects">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {stats.recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}/overview`}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-muted transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground uppercase">
                            {project.sourceKind}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatRelativeTime(project.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {project.recommendation && (
                        <RecommendationBadge
                          recommendation={project.recommendation as RecommendationKind}
                          showIcon={false}
                        />
                      )}
                      <StatusBadge status={project.status} showIcon={false} />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
