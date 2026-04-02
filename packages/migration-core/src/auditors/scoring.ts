import type {
  AuditFinding,
  BuilderHint,
  MigrationDifficulty,
  MigrationRecommendation
} from "@wp2emdash/shared-types";

export interface DifficultyInputs {
  unsupportedBlockOccurrences: number;
  uniqueUnsupportedBlocks: number;
  shortcodeOccurrences: number;
  builderHints: BuilderHint[];
  pluginHints: BuilderHint[];
  customPostTypeCount: number;
  findings: AuditFinding[];
}

export interface DifficultyScoreResult {
  points: number;
  difficulty: MigrationDifficulty;
  recommendation: MigrationRecommendation;
}

export function scoreDifficulty(inputs: DifficultyInputs): DifficultyScoreResult {
  const errorCount = inputs.findings.filter((finding) => finding.severity === "error").length;
  const warningCount = inputs.findings.filter((finding) => finding.severity === "warning").length;
  const strongBuilderHints = inputs.builderHints.filter((hint) => hint.confidence >= 0.8).length;
  const strongPluginHints = inputs.pluginHints.filter((hint) => hint.confidence >= 0.8).length;

  const points =
    (inputs.unsupportedBlockOccurrences * 2) +
    (inputs.uniqueUnsupportedBlocks * 3) +
    (inputs.shortcodeOccurrences * 2) +
    (strongBuilderHints * 5) +
    (strongPluginHints * 2) +
    (inputs.customPostTypeCount * 2) +
    (errorCount * 5) +
    warningCount;

  const difficulty: MigrationDifficulty =
    points >= 25 ? "High" : points >= 10 ? "Medium" : "Low";

  const recommendation: MigrationRecommendation =
    difficulty === "High" && (strongBuilderHints > 0 || errorCount > 0)
      ? "rebuild-recommended"
      : difficulty === "Low" && errorCount === 0
        ? "ready-for-import"
        : "import-with-manual-cleanup";

  return {
    points,
    difficulty,
    recommendation
  };
}

