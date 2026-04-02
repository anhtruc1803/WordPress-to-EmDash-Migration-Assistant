/**
 * Migration Service — Bridge to @wp2emdash/migration-core
 *
 * This service wraps core pipeline functions and stores results
 * back into the project store. It is the single integration point
 * between the UI layer and the migration engine.
 */

import {
  loadSourceBundle,
  runMigrationWorkflow,
} from "@wp2emdash/migration-core";
import { auditBundle } from "@wp2emdash/migration-core";
import { transformBundle } from "@wp2emdash/migration-core";
import { createImportPlan } from "@wp2emdash/migration-core";
import type { MigrationProject } from "@console/lib/types";
import { getProject, updateProject, deriveProjectStatus } from "./project-store";

export async function runProjectAudit(projectId: string): Promise<MigrationProject> {
  const project = await getProject(projectId);
  if (!project) throw new Error(`Project not found: ${projectId}`);

  // Load source bundle using the core connector
  const bundle = await loadSourceBundle({
    sourceKind: project.source.kind,
    location: project.source.location,
    authToken: project.source.authToken,
  });

  // Run audit
  const audit = auditBundle(bundle);

  // Run transform
  const transform = transformBundle(bundle);

  // Create import plan
  const plan = createImportPlan(bundle, audit, transform);

  // Update project with results
  const updated = await updateProject(projectId, {
    latestBundle: bundle,
    latestAudit: audit,
    latestTransform: transform,
    latestPlan: plan,
    source: {
      ...project.source,
      validated: true,
    },
  });

  if (!updated) throw new Error(`Failed to update project: ${projectId}`);

  // Derive and update status
  const status = deriveProjectStatus(updated);
  const final = await updateProject(projectId, { status });

  return final ?? updated;
}

export async function runProjectDryRun(projectId: string): Promise<MigrationProject> {
  // For now, dry-run is equivalent to a full audit+transform+plan
  // since the core pipeline does all steps together.
  // In the future, this could be a lighter-weight operation.
  return runProjectAudit(projectId);
}

export async function validateProjectSource(projectId: string): Promise<{
  valid: boolean;
  error?: string;
}> {
  const project = await getProject(projectId);
  if (!project) throw new Error(`Project not found: ${projectId}`);

  try {
    // Attempt to load the source to validate it
    await loadSourceBundle({
      sourceKind: project.source.kind,
      location: project.source.location,
      authToken: project.source.authToken,
    });

    await updateProject(projectId, {
      source: { ...project.source, validated: true, validationError: undefined },
      status: "source-connected",
    });

    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await updateProject(projectId, {
      source: { ...project.source, validated: false, validationError: message },
    });
    return { valid: false, error: message };
  }
}
