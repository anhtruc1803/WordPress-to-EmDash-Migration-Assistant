# Audit Pipeline

## Who This Serves

- engineers adding detectors
- reviewers assessing migration honesty
- product leads wanting a clear explanation of scoring

## Purpose

The audit pipeline answers:

- what content exists
- what block types are present
- which parts are supported
- which features indicate migration risk
- how difficult the migration is likely to be

## Pipeline Steps

1. count normalized content entities
2. parse blocks per content item
3. inventory supported and unsupported blocks
4. detect shortcodes
5. detect scripts, iframes, and raw HTML exposure
6. detect builder/plugin hints through regex signals
7. score difficulty and choose a recommendation

## Current Detectors

Implemented detectors cover:

- unsupported Gutenberg blocks
- raw HTML blocks
- script fragments
- iframe/embed fragments
- shortcodes
- Elementor
- WPBakery / Visual Composer
- Divi
- Oxygen Builder
- Slider Revolution
- Contact Form 7
- WooCommerce

These signals are heuristic and intentionally transparent.

## Difficulty Scoring

Scoring uses weighted inputs from:

- unsupported block occurrences
- unique unsupported block count
- shortcode occurrences
- builder hints
- plugin hints
- custom post type count
- error and warning findings

Output:

- `Low`
- `Medium`
- `High`

Recommendation:

- `ready-for-import`
- `import-with-manual-cleanup`
- `rebuild-recommended`

## Limitations

- heuristics are regex-driven
- there is no historical calibration dataset
- scores are transparent but not yet configurable

