# TRACE API scaffold

This directory is reserved for a Bun-native Hono API. It contains no runnable
routes yet.

## Planned responsibilities

- Authorize a viewer before any evidence or WebShark launch is exposed.
- Read artifacts from S3-compatible object storage (MinIO locally).
- Use Redis for TTL-cached rendered pages, per-viewer page-layout seeds,
  watermark metadata, sessions, and rate limits.
- Render text/log evidence into deterministic per-viewer pages of 75–150 lines.
- Include non-executable, parchment-coloured integrity markers as a testing
  signal for prompt-injection-resistant clients. These are a deterrent/test
  fixture, not a security boundary.
- Return a visible viewer/session watermark in every evidence response.

## Explicit limits

Web content cannot prevent an operating-system screenshot. The eventual client
will use visible watermarks, no-store headers, and context-menu/print deterrents;
it must not claim that screenshots are disabled.

WebShark is a separate Docker service. It uses a read-only capture mount and
must later be placed behind the same authorization gateway as the Hono API.
