/**
 * Seed script — generates demo project data from the WXR fixture.
 * Run with: pnpm seed (or npx tsx src/scripts/seed-demo.ts)
 */
import { resolve } from "node:path";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";

// We need to run the core pipeline on the fixture
// Since we're in the console package, we import from migration-core
import { auditBundle, transformBundle, createImportPlan } from "@wp2emdash/migration-core";
import { loadWxrSource } from "@wp2emdash/migration-core";
import type { MigrationProject } from "../lib/types.js";

const DATA_DIR = resolve(process.cwd(), ".migration-data");
const PROJECTS_FILE = resolve(DATA_DIR, "projects.json");
const FIXTURE_PATH = resolve(process.cwd(), "../test-fixtures/wxr/sample-site.xml");

async function seed() {
  console.log("🌱 Seeding demo data...");
  console.log(`  Fixture: ${FIXTURE_PATH}`);

  // Load bundle from WXR fixture
  const bundle = await loadWxrSource(FIXTURE_PATH);
  console.log(`  Loaded ${bundle.contentItems.length} content items`);

  // Run audit
  const audit = auditBundle(bundle);
  console.log(`  Audit: ${audit.difficulty} difficulty, ${audit.findings.length} findings`);

  // Run transform
  const transform = transformBundle(bundle);
  console.log(`  Transform: ${transform.items.length} items, ${transform.warnings.length} warnings`);

  // Create import plan
  const plan = createImportPlan(bundle, audit, transform);
  console.log(`  Plan: ${plan.entries.length} entries, ${plan.unresolvedItems.length} unresolved`);

  const now = new Date().toISOString();

  const demoProject: MigrationProject = {
    id: "demo-001",
    name: "Sample WordPress Site",
    createdAt: now,
    updatedAt: now,
    status: "dry-run-complete",
    source: {
      kind: "wxr",
      location: FIXTURE_PATH,
      validated: true,
    },
    latestBundle: bundle,
    latestAudit: audit,
    latestTransform: transform,
    latestPlan: plan,
    settings: {
      outputDirectory: resolve(DATA_DIR, "artifacts"),
    },
  };

  // Create a second project (draft, no data)
  const draftProject: MigrationProject = {
    id: "demo-002",
    name: "Client Blog Migration",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    status: "draft",
    source: {
      kind: "api",
      location: "https://example.com/wp-json",
      validated: false,
    },
    settings: {
      outputDirectory: resolve(DATA_DIR, "artifacts"),
    },
  };

  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(PROJECTS_FILE, JSON.stringify([demoProject, draftProject], null, 2), "utf-8");

  console.log("\n✅ Demo data seeded successfully!");
  console.log(`  Projects file: ${PROJECTS_FILE}`);
  console.log(`  2 projects created: "${demoProject.name}" (with data), "${draftProject.name}" (draft)`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
