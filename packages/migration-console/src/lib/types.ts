import type {
  AuditResult,
  TransformResult,
  ImportPlan,
  WordPressSourceBundle,
  GeneratedArtifacts,
} from "@wp2emdash/shared-types";

// ──────────────────────────────────────────────
// Project status — maps to the migration workflow
// ──────────────────────────────────────────────
export type ProjectStatus =
  | "draft"
  | "source-connected"
  | "audited"
  | "dry-run-complete"
  | "ready-for-import"
  | "blocked";

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  draft: "Draft",
  "source-connected": "Source Connected",
  audited: "Audited",
  "dry-run-complete": "Dry Run Complete",
  "ready-for-import": "Ready for Import",
  blocked: "Blocked",
};

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  "draft",
  "source-connected",
  "audited",
  "dry-run-complete",
  "ready-for-import",
  "blocked",
];

// ──────────────────────────────────────────────
// Severity — maps backend severity to UI labels
// ──────────────────────────────────────────────
export type UISeverity = "info" | "low" | "medium" | "high";

export const SEVERITY_LABELS: Record<UISeverity, string> = {
  info: "Info",
  low: "Low",
  medium: "Medium",
  high: "High",
};

/** Map backend finding severity to UI severity */
export function mapSeverity(backendSeverity: "info" | "warning" | "error"): UISeverity {
  switch (backendSeverity) {
    case "info": return "info";
    case "warning": return "medium";
    case "error": return "high";
  }
}

// ──────────────────────────────────────────────
// Recommendation labels
// ──────────────────────────────────────────────
export type RecommendationKind = "ready-for-import" | "import-with-manual-cleanup" | "rebuild-recommended";

export const RECOMMENDATION_LABELS: Record<RecommendationKind, string> = {
  "ready-for-import": "Ready",
  "import-with-manual-cleanup": "Cleanup Needed",
  "rebuild-recommended": "Rebuild Recommended",
};

// ──────────────────────────────────────────────
// Migration project — the core UI data model
// ──────────────────────────────────────────────
export interface MigrationProject {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  source: {
    kind: "wxr" | "api";
    location: string;
    validated: boolean;
    validationError?: string;
    authToken?: string;
  };
  latestAudit?: AuditResult;
  latestTransform?: TransformResult;
  latestPlan?: ImportPlan;
  latestBundle?: WordPressSourceBundle;
  artifacts?: GeneratedArtifacts;
  settings: {
    outputDirectory: string;
    targetUrl?: string;
  };
}

// ──────────────────────────────────────────────
// API response types
// ──────────────────────────────────────────────
export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface ProjectListItem {
  id: string;
  name: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  sourceKind: "wxr" | "api";
  difficulty?: string;
  recommendation?: string;
  unresolvedCount?: number;
}

// ──────────────────────────────────────────────
// Dashboard stats
// ──────────────────────────────────────────────
export interface DashboardStats {
  totalProjects: number;
  projectsByStatus: Record<ProjectStatus, number>;
  totalManualFixes: number;
  blockedProjects: number;
  recentProjects: ProjectListItem[];
}
