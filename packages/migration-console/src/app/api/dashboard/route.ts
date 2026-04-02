import { NextResponse } from "next/server";
import { listProjects } from "@console/services/project-store";
import type { DashboardStats, ProjectStatus } from "@console/lib/types";

export async function GET() {
  try {
    const projects = await listProjects();

    const projectsByStatus: Record<ProjectStatus, number> = {
      draft: 0,
      "source-connected": 0,
      audited: 0,
      "dry-run-complete": 0,
      "ready-for-import": 0,
      blocked: 0,
    };

    let totalManualFixes = 0;
    let blockedProjects = 0;

    for (const p of projects) {
      projectsByStatus[p.status] = (projectsByStatus[p.status] ?? 0) + 1;
      totalManualFixes += p.unresolvedCount ?? 0;
      if (p.status === "blocked") blockedProjects++;
    }

    const stats: DashboardStats = {
      totalProjects: projects.length,
      projectsByStatus,
      totalManualFixes,
      blockedProjects,
      recentProjects: projects
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5),
    };

    return NextResponse.json(stats);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
