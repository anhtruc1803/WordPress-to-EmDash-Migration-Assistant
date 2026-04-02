# Security Considerations

## Current Positives

- the tool does not execute imported scripts
- risky script content is flagged as unsupported for import
- there is no credential storage layer in the current codebase

## Current Concerns

- remote REST fetching trusts the provided URL
- no explicit auth flow exists for private WordPress sites
- report and artifact outputs may contain raw payload fragments from source content

## Practical Guidance

- treat artifacts as migration working data, not sanitized public output
- review target and source URLs before using live endpoints
- introduce stricter network and auth handling before enterprise use

