# Runtime Assumptions

## Current Assumptions

- Node runtime provides global `fetch`
- local filesystem is writable for artifact output
- WordPress REST API is reachable and exposes standard collections
- WXR exports are structurally valid enough for `fast-xml-parser`
- EmDash target validation can be approximated with an HTTP `HEAD` request

## Important Reality

Several of these assumptions are MVP-friendly rather than hardened runtime guarantees.

The most important one:

- target validation is not equivalent to import compatibility

