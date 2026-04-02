# Tech Debt Register

| Debt ID | Area | Description | Impact | Priority | Proposed Remediation |
| --- | --- | --- | --- | --- | --- |
| TD-001 | Target integration | `import` remains plan-only behind `PlanOnlyEmDashAdapter`. | Blocks true end-to-end migration execution. | High | Define a real EmDash import contract and implement an adapter with integration tests. |
| TD-002 | Parsing | Gutenberg and HTML parsing rely on regex/string heuristics rather than a richer AST pipeline. | Can mis-handle complex nested markup or malformed content. | High | Introduce richer parsing abstractions for blocks and selected HTML fragments. |
| TD-003 | Coverage | Tests are unit-focused and use minimal fixtures. | Regressions may slip through for real-world content mixes. | High | Add larger fixture suites and end-to-end CLI tests. |
| TD-004 | Reporting compatibility | Artifact schemas are implicit in code and docs, not versioned. | Downstream consumers may break if fields change. | Medium | Document schema compatibility rules and add version metadata if artifacts become public contracts. |
| TD-005 | Planner efficiency | `createImportPlan` performs repeated `find`/`filter` scans per item. | Fine for MVP scale, weaker for very large migrations. | Medium | Pre-index transform documents and findings by item ID. |
| TD-006 | Error taxonomy | Most runtime errors are plain `Error` objects or warnings without richer machine codes. | Makes automation and troubleshooting less precise. | Medium | Introduce structured error codes and categorized runtime diagnostics. |
| TD-007 | Source completeness | WXR parser does not capture all WordPress metadata or attachment details. | Some migrations may need richer source context. | Medium | Expand source normalization coverage with clear schema additions. |
| TD-008 | Dist cleanliness | Old build outputs can linger unless `clean` runs first. | Can confuse reviewers inspecting `dist/`. | Low | Run clean before release builds or adjust build pipeline to remove stale outputs. |

