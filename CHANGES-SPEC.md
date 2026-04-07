<!-- Standalone changes spec — drop this alongside MXIT_SPEC.md -->

# Changes Specification

**Version 1.0**

A change is a self-contained folder that captures WHY something was built, WHAT behavior changed, HOW it was designed, and WHAT tasks were completed. When done, changes are archived — preserving the full decision context forever.

## Directory structure

```
changes/
  <kebab-case-name>/
    PROPOSAL.md         <- Required. Why this change exists.
    SPECS.md            <- Optional. What behavior changes (delta format).
    DESIGN.md           <- Optional. Technical decisions and approach.
    TASKS.md            <- Optional. Implementation checklist (mxit format).
  archive/
    YYYY-MM-DD-<name>/  <- Completed changes, preserved for history.
      PROPOSAL.md
      SPECS.md
      DESIGN.md
      TASKS.md
```

## PROPOSAL.md

Always required. Even for small changes — one paragraph of WHY.

### Frontmatter

```yaml
---
status: proposing
created: 2026-03-26
schema: feature
---
```

**Status values:**

| Status | Meaning |
|--------|---------|
| `exploring` | Thinking about it, no commitment |
| `proposing` | Writing the proposal |
| `speccing` | Writing specs |
| `designing` | Writing design doc |
| `implementing` | Working through tasks |
| `verifying` | Checking implementation against artifacts |
| `archived` | Done, moved to archive |

**Schema values** (conventions, not enforced):

| Schema | Flow | When to use |
|--------|------|-------------|
| `feature` | propose -> spec -> design -> tasks -> implement -> verify -> archive | New functionality |
| `bugfix` | propose -> tasks -> implement -> archive | Bug fixes |
| `research` | propose -> explore | Thinking, no implementation |
| `spike` | propose -> tasks -> implement | Quick experiments (no archive) |

### Body

```markdown
# Change Name

## Why
[1-2 sentences. The problem or opportunity.]

## Scope
[What's in scope. What's explicitly NOT in scope.]

## Impact
[Files, systems, APIs affected.]
```

## SPECS.md

Optional. Recommended for features and API changes. Uses delta format — describes what's CHANGING, not the full system.

See `MXIT_SPEC.md` for the mxit format used in spec scenarios. See `fold:mxit:spec` skill for full spec writing guidance.

### Delta sections

```markdown
## ADDED Requirements

### Requirement Name
Description using RFC 2119 keywords (MUST/SHALL/SHOULD/MAY).

- [ ] WHEN trigger condition THEN expected result
- [ ] WHEN edge case THEN handled correctly

## MODIFIED Requirements

### Existing Requirement Name
Updated description. Note what changed.

- [ ] WHEN updated condition THEN new behavior #spec:modified

## REMOVED Requirements

### Deprecated Requirement Name
Reason for removal. Migration guidance if applicable.
```

### Merging on archive

When a change is archived:
- **ADDED** requirements: append to the project's main spec file
- **MODIFIED** requirements: replace the matching requirement
- **REMOVED** requirements: delete from the main spec file

## DESIGN.md

Optional. Recommended for features with technical decisions.

```markdown
# Design: Change Name

## Approach
[High-level technical strategy.]

## Decision: [Decision Name]
[What was chosen and why. Keep it brief.]

## Risks
[What could go wrong.]
```

## TASKS.md

Optional. Uses full mxit format — statuses, tags, due dates, agent assignments, resolution brackets. See `MXIT_SPEC.md` for format details.

Link tasks to specs with `#spec:` tags:

```markdown
- [ ] Implement session timeout #backend #spec:auth/session-expiration -> 2026-04-05
- [x] [done: JWT middleware] Add token validation #backend #spec:auth/token-validation
```

## Archive

When all tasks are complete and verified:

1. Update PROPOSAL.md status to `archived`
2. If SPECS.md has deltas, merge into project's main spec file
3. Move the folder: `changes/<name>/ -> changes/archive/YYYY-MM-DD-<name>/`

Archive preserves the full context: proposal (WHY), specs (WHAT), design (HOW), tasks (WHAT WAS DONE, with results). This is the project's decision journal.

## Single-writer model

Each change directory is a shard — one agent works on it at a time. No locking needed. If multiple agents need to work on the same change, serialize them (one after the other). See `fold/research/single-writer-tasks-as-db.md` for the rationale.

Cross-change references use tags (`#needs:tag`, `#blocked-by:tag`) — read-only checks, no writes to other files.

## License

Per Creative Commons CC0 1.0 Universal.
