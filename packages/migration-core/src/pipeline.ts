import type { ExecutionArtifacts, GeneratedArtifacts, WordPressSourceBundle } from "@wp2emdash/shared-types";

import { auditBundle } from "./auditors/audit-engine.js";
import { PlanOnlyEmDashAdapter } from "./connectors/emdash-target.js";
import { loadRestSource } from "./connectors/rest-connector.js";
import { loadWxrSource } from "./connectors/wxr-connector.js";
import { createImportPlan } from "./planners/import-planner.js";
import { writeExecutionArtifacts } from "./reporters/artifact-writer.js";
import { transformBundle } from "./transformers/content-transformer.js";

export interface WorkflowOptions {
  sourceKind: "wxr" | "api";
  location: string;
  outputDirectory?: string;
  targetUrl?: string;
  /** Bearer token / Application Password for authenticated WordPress REST API access. */
  authToken?: string;
}

export async function loadSourceBundle(options: WorkflowOptions): Promise<WordPressSourceBundle> {
  if (options.sourceKind === "wxr") {
    return loadWxrSource(options.location);
  }

  const restOptions = options.authToken ? { authToken: options.authToken } : {};
  return loadRestSource(options.location, restOptions);
}

export async function runMigrationWorkflow(options: WorkflowOptions): Promise<ExecutionArtifacts> {
  const bundle = await loadSourceBundle(options);
  const audit = auditBundle(bundle);
  const transform = transformBundle(bundle);
  let targetValidationNote: string | undefined;

  if (options.targetUrl) {
    const adapter = new PlanOnlyEmDashAdapter();
    const validation = await adapter.validate(options.targetUrl);
    targetValidationNote = validation.note;
  }

  const plan = createImportPlan(bundle, audit, transform, {
    ...(options.targetUrl ? { targetUrl: options.targetUrl } : {}),
    ...(targetValidationNote ? { targetValidationNote } : {})
  });

  return {
    bundle,
    audit,
    transform,
    plan
  };
}

export async function runWorkflowAndWriteArtifacts(options: WorkflowOptions): Promise<ExecutionArtifacts & { artifacts: GeneratedArtifacts }> {
  const execution = await runMigrationWorkflow(options);
  const artifacts = await writeExecutionArtifacts(options.outputDirectory ?? "artifacts", execution);

  return {
    ...execution,
    artifacts
  };
}
