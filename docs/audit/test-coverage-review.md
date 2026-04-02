# Test Coverage Review

## What Is Currently Tested

- WXR parsing
- REST normalization
- shortcode detection
- difficulty scoring
- transform fallback behavior
- artifact writer output

## What Is Not Tested

- CLI help and argument validation
- live REST fetching behavior
- pagination edge cases
- target validation behavior
- many block transform branches
- malformed WXR inputs
- malformed Gutenberg comment structures

## Most Important Missing Tests

- integration-style CLI tests over fixture data
- multi-page REST pagination behavior
- script and iframe detection assertions in both audit and transform outputs
- unsupported custom block handling with richer payloads
- import planner behavior for `blocked` items

## Fixture Gaps

- only one WXR fixture
- only one main REST scenario
- no fixture dedicated to custom post type payload complexity
- no builder-heavy fixture with more than one plugin/builder signal

