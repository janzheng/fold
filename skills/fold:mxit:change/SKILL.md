---
name: fold:mxit:change
description: "Manage structured changes — propose, spec, design, implement, verify, archive. Use when the user wants to start a new feature, plan a refactor, or track a non-trivial piece of work with full context preservation."
version: 1.0.0
license: MIT
---

# fold:mxit:change — Structured Change Lifecycle

Manage non-trivial work as a self-contained change with proposal, specs, design, and tasks. Each change is a folder. When done, archive it — the decision history is preserved forever.

## When to use

- User says "let's add X" or "I want to build Y" (non-trivial feature)
- Work spans multiple files or sessions
- You want to preserve WHY something was built, not just WHAT
- You want to think before coding

**Don't use for:** Quick bug fixes, one-line changes, or tasks that fit in a single TASKS.md entry.

## The change directory

```
changes/
  add-dark-mode/
    PROPOSAL.md         <- WHY (always required, even for small changes)
    SPECS.md            <- WHAT changes (optional, delta format)
    DESIGN.md           <- HOW (optional, technical decisions)
    TASKS.md            <- Implementation checklist (mxit format)
  fix-auth-timeout/
    PROPOSAL.md         <- Small change, just proposal + tasks
    TASKS.md
  archive/
    2026-03-26-add-websockets/
      PROPOSAL.md       <- Full context preserved
      SPECS.md
      DESIGN.md
      TASKS.md          <- With [done: ...] results on every task
```

## Workflow

### 1. Explore (optional)

If requirements are unclear, use `fold:mxit:brainstorm` first. When insights crystallize, promote to a change.

**IMPORTANT:** During exploration, do NOT write code. Think, investigate, diagram. Code comes later.

### 2. Create the change

```bash
mkdir -p changes/<kebab-case-name>
```

Write PROPOSAL.md:

```markdown
---
status: proposing
created: 2026-03-26
schema: feature
---

# Add Dark Mode

## Why
Users report eye strain during evening use. Three support tickets this month.

## Scope
- Theme toggle in settings
- System preference detection
- NOT custom themes (future work)

## Impact
- src/styles/ — new CSS variables
- src/components/ThemeToggle.tsx — new component
```

**Status values:** `exploring`, `proposing`, `speccing`, `designing`, `implementing`, `verifying`, `archived`

**Schema values** (conventions, not enforced):
- `feature` — full flow: propose -> spec -> design -> tasks -> implement -> verify -> archive
- `bugfix` — minimal: propose -> tasks -> implement -> archive
- `research` — thinking only: propose -> explore (no implementation)
- `spike` — quick experiment: propose -> tasks -> implement (no archive, just learnings)

### 3. Spec (optional, recommended for features)

Write SPECS.md with delta format — what's being ADDED, MODIFIED, or REMOVED:

```markdown
# Specs: Add Dark Mode

## ADDED Requirements

### Theme Toggle
The system SHOULD provide a theme toggle in settings.

- [ ] WHEN user clicks toggle THEN theme switches immediately
- [ ] WHEN user sets preference THEN it persists across sessions
- [ ] WHEN app loads THEN detect system preference if no user preference set

## MODIFIED Requirements

### Color System
- [ ] WHEN dark mode active THEN all surfaces use dark palette #spec:modified
```

Spec scenarios are mxit checkboxes. Mark them `[x] [approved]` when agreed upon.

See `fold:mxit:spec` skill for full spec format details.

### 4. Design (optional, recommended for complex features)

Write DESIGN.md:

```markdown
# Design: Add Dark Mode

## Approach
CSS custom properties + React context.

## Decision: Context over Redux
Simple binary state. Redux is overkill.

## Decision: CSS Variables over CSS-in-JS
Works with existing stylesheets. No runtime overhead.

## Risks
- Third-party components may not respect CSS variables
```

### 5. Create tasks

Write TASKS.md in full mxit format:

```markdown
# Add Dark Mode

## Theme Infrastructure

- [ ] Create ThemeContext with light/dark state #frontend
- [ ] Add CSS custom properties for all colors #frontend
- [ ] Implement localStorage persistence #frontend
- [ ] Add system preference detection #frontend -> 2026-04-05

## UI Components

- [ ] Create ThemeToggle component #frontend #needs:ThemeContext
- [ ] Add toggle to settings page #frontend #needs:ThemeToggle
- [ ] Update Header with quick toggle #frontend

## Verify

- [ ] Run fold:verify against SPECS.md #verify
```

### 6. Implement

Work through tasks. Use `fold:mxit:run` to execute them. Mark done with results:

```markdown
- [x] [done: created with useContext + useState] Create ThemeContext #frontend
```

Update PROPOSAL.md status to `implementing`.

### 7. Verify (recommended)

Use `fold:verify` to check implementation against specs and design. Fix any gaps.

### 8. Archive

When all tasks are done:

1. Update PROPOSAL.md status to `archived`
2. If SPECS.md has deltas, merge them into the project's main spec file
3. Move the change folder:

```bash
mv changes/add-dark-mode changes/archive/$(date +%Y-%m-%d)-add-dark-mode
```

Everything is preserved. The archive is the project's decision journal.

## Rules

- **PROPOSAL.md is always required.** Even one paragraph of WHY. Without it, the change has no context.
- **TASKS.md uses mxit format.** Full richness: tags, dates, agents, resolution brackets.
- **SPECS.md and DESIGN.md are optional.** Use for features. Skip for bug fixes and spikes.
- **Archive preserves everything.** Don't delete completed changes — move to archive.
- **Status frontmatter tracks lifecycle.** Update it as you progress through the workflow.
- **One change, one concern.** If scope creeps, split into two changes.
- **Think before coding.** The proposal and spec phases exist to prevent building the wrong thing.
