# fold.yaml Configuration Spec

**Version 1.0 — Optional**

A `fold.yaml` file in the project root configures fold behavior for that project. If absent, fold uses defaults. This is inspired by OpenSpec's `config.yaml` context injection pattern.

## Format

```yaml
# fold.yaml — project-level fold configuration

# Default schema for changes/ lifecycle (optional, default: feature)
schema: feature

# Project context injected into all fold skill prompts (optional)
# Max 5000 chars. Agents see this when working on any fold artifact.
context: |
  Tech stack: Deno, TypeScript, Hono, Cloudflare Workers
  Testing: Deno.test + vitest for browser code
  We use mxit format for all task tracking
  All specs use GIVEN/WHEN/THEN scenarios
  Database: SQLite via D1

# Per-artifact rules (optional)
# Only injected when working on that artifact type.
rules:
  proposal:
    - Include rollback plan for risky changes
    - Link to related BRIEF docs if they exist
  specs:
    - Use RFC 2119 keywords (MUST/SHALL/SHOULD/MAY)
    - At least one scenario per requirement
  design:
    - Document rejected alternatives, not just chosen approach
    - Include ASCII diagrams for architecture decisions
  tasks:
    - Use mxit format with tags, due dates, agent assignments
    - Break into single-session chunks
    - Group by area (frontend, backend, infra)
```

## Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `schema` | string | `feature` | Default schema for new changes |
| `context` | string | empty | Project context injected into all fold skill prompts |
| `rules` | map of string arrays | empty | Per-artifact rules, keyed by artifact type |

## How agents use it

When a fold skill runs (e.g., `fold:mxit:change`, `fold:mxit:spec`, `fold:verify`), the skill SHOULD:

1. Check for `fold.yaml` in the project root (or nearest git root)
2. If found, read `context` and inject it as project background
3. If working on a specific artifact type, also inject matching `rules`

Skills that don't create artifacts (e.g., `fold:playtest:explore`) SHOULD still read `context` for project awareness.

## Schema values

Same as CHANGES-SPEC.md:

| Schema | Flow |
|--------|------|
| `feature` | propose -> spec -> design -> tasks -> implement -> verify -> archive |
| `bugfix` | propose -> tasks -> implement -> archive |
| `research` | propose -> explore (no implementation) |
| `spike` | propose -> tasks -> implement (no archive) |

Custom schema names are allowed. The schema name is a convention — fold doesn't enforce the flow.

## Rules

- `fold.yaml` is optional. fold works without it.
- Context should be concise — it's injected into every prompt. Don't dump your entire README here.
- Rules are advisory — agents should follow them but they're not enforced programmatically.
- This file is checked into version control. It's part of the project, not personal config.
