/**
 * Project Store — JSON file-based persistence layer
 *
 * ⚠️ TEMPORARY BRIDGE: This is a file-based store for MVP/demo purposes.
 * In production, replace with a proper database (SQLite, PostgreSQL, etc.).
 *
 * All project data including audit results, transform results, and import plans
 * are stored as JSON files in the data directory.
 */

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import type { MigrationProject, ProjectListItem, ProjectStatus } from "@console/lib/types";

const DATA_DIR = resolve(process.cwd(), ".migration-data");
const PROJECTS_FILE = resolve(DATA_DIR, "projects.json");

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readProjects(): Promise<MigrationProject[]> {
  try {
    const raw = await readFile(PROJECTS_FILE, "utf-8");
    return JSON.parse(raw) as MigrationProject[];
  } catch {
    return [];
  }
}

async function writeProjects(projects: MigrationProject[]): Promise<void> {
  await ensureDataDir();
  await writeFile(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
}

// ── CRUD Operations ──────────────────────────────

export async function listProjects(): Promise<ProjectListItem[]> {
  const projects = await readProjects();
  return projects.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
    sourceKind: p.source.kind,
    difficulty: p.latestAudit?.difficulty,
    recommendation: p.latestAudit?.recommendation,
    unresolvedCount: p.latestPlan?.unresolvedItems.length,
  }));
}

export async function getProject(id: string): Promise<MigrationProject | undefined> {
  const projects = await readProjects();
  return projects.find((p) => p.id === id);
}

export async function createProject(data: {
  name: string;
  sourceKind: "wxr" | "api";
  location: string;
  authToken?: string;
}): Promise<MigrationProject> {
  const projects = await readProjects();
  const now = new Date().toISOString();

  const project: MigrationProject = {
    id: randomUUID().slice(0, 8),
    name: data.name,
    createdAt: now,
    updatedAt: now,
    status: "draft",
    source: {
      kind: data.sourceKind,
      location: data.location,
      validated: false,
      authToken: data.authToken,
    },
    settings: {
      outputDirectory: resolve(DATA_DIR, "artifacts"),
    },
  };

  projects.push(project);
  await writeProjects(projects);
  return project;
}

export async function updateProject(
  id: string,
  update: Partial<MigrationProject>
): Promise<MigrationProject | undefined> {
  const projects = await readProjects();
  const index = projects.findIndex((p) => p.id === id);
  if (index === -1) return undefined;

  const project = projects[index]!;
  const updated: MigrationProject = {
    ...project,
    ...update,
    id: project.id, // prevent ID override
    updatedAt: new Date().toISOString(),
  };

  projects[index] = updated;
  await writeProjects(projects);
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = await readProjects();
  const filtered = projects.filter((p) => p.id !== id);
  if (filtered.length === projects.length) return false;
  await writeProjects(filtered);
  return true;
}

export function deriveProjectStatus(project: MigrationProject): ProjectStatus {
  if (!project.source.validated && !project.latestAudit) return "draft";
  if (project.source.validated && !project.latestAudit) return "source-connected";
  if (project.latestAudit && !project.latestTransform) return "audited";

  const hasErrors = project.latestPlan?.unresolvedItems.some((item) => item.severity === "error");
  if (hasErrors) return "blocked";

  if (project.latestTransform && !project.latestPlan) return "dry-run-complete";

  const allReady = project.latestPlan?.entries.every((e) => e.status === "ready");
  if (allReady) return "ready-for-import";

  return "dry-run-complete";
}
