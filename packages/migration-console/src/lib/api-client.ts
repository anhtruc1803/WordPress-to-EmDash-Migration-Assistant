import type { MigrationProject, ProjectListItem, DashboardStats, ApiResponse } from "./types";

const API_BASE = "/api";

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ── Projects ──────────────────────────────────
export async function fetchProjects(): Promise<ProjectListItem[]> {
  return fetcher<ProjectListItem[]>("/projects");
}

export async function fetchProject(id: string): Promise<MigrationProject> {
  return fetcher<MigrationProject>(`/projects/${id}`);
}

export async function createProject(data: {
  name: string;
  sourceKind: "wxr" | "api";
  location: string;
  authToken?: string;
}): Promise<MigrationProject> {
  return fetcher<MigrationProject>("/projects", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProject(
  id: string,
  data: Partial<MigrationProject>
): Promise<MigrationProject> {
  return fetcher<MigrationProject>(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

// ── Actions ───────────────────────────────────
export async function runAudit(projectId: string): Promise<MigrationProject> {
  return fetcher<MigrationProject>(`/projects/${projectId}/audit`, {
    method: "POST",
  });
}

export async function runDryRun(projectId: string): Promise<MigrationProject> {
  return fetcher<MigrationProject>(`/projects/${projectId}/dry-run`, {
    method: "POST",
  });
}

// ── Dashboard ─────────────────────────────────
export async function fetchDashboard(): Promise<DashboardStats> {
  return fetcher<DashboardStats>("/dashboard");
}

// ── Artifacts ─────────────────────────────────
export interface ArtifactFileInfo {
  name: string;
  path: string;
  size: number;
  type: string;
}

export async function fetchArtifacts(projectId: string): Promise<ArtifactFileInfo[]> {
  return fetcher<ArtifactFileInfo[]>(`/projects/${projectId}/artifacts`);
}
