# Risk Assessment

## Parser Risk

Risk level: medium to high.

Why:

- WXR parsing depends on expected export structure
- Gutenberg parsing is comment-pattern based
- HTML fragment interpretation is heuristic

Consequence:

- malformed or unusual content may normalize or transform incorrectly

## Transform Risk

Risk level: medium.

Why:

- supported block list is intentionally small
- fallback behavior is safe but can leave more manual work
- unsupported custom blocks become generic fallbacks

Consequence:

- migrations remain honest, but transformation completeness is limited

## Data-Loss Risk

Risk level: medium.

Why:

- the project deliberately preserves risky content as raw payload fallbacks
- this lowers silent loss risk
- but unsupported details inside simplified HTML conversions can still lose fidelity

## Reporting Risk

Risk level: low to medium.

Why:

- current artifacts are explicit and simple
- schema/versioning is not formalized yet

Consequence:

- downstream tooling may break if artifact shapes evolve without coordination

## Integration Risk

Risk level: high.

Why:

- there is no real EmDash write path
- target validation is only a `HEAD` request

Consequence:

- end-to-end migration readiness depends on future integration work

## Maintainability Risk

Risk level: medium.

Why:

- current module boundaries are good
- shared type blast radius is high
- parser and transformer files can grow quickly as features expand

