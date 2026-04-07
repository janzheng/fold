---
name: fold:audit
description: Deep autonomous codebase audit — launch parallel agent waves to find race conditions, error swallowing, security issues, logic bugs, and wiring failures. Produces TASKS-AUDIT.md with prioritized findings for mxit. The "deep discover" facet of fold. Use when the user says "audit this", "find bugs", "scan for issues", "what's broken", "correctness sweep", "deep audit", "code audit", "fold:audit", or wants a comprehensive read-only codebase analysis.
---

# fold:audit — Deep Parallel Codebase Audit

The **deep discover** facet of fold. Launches waves of parallel agents to read the entire codebase and catalog every correctness issue. **Read-only** — no fixes applied. All findings go into `TASKS-AUDIT.md`, which feeds directly into mxit for tracking and execution.

The key insight: a single agent can't hold a large codebase in context. But 30-40 focused agents, each reading 5-10 files deeply, can cover everything.

> **Relationship to other fold skills:**
> - `fold:playtest:explore` = one agent, open-ended walkthrough, quick
> - `fold:playtest:run` = scripted playtest with checklist
> - **`fold:audit`** = industrial-scale parallel discovery, structured waves, exhaustive
> - `fold:playtest:improve` = analyze then fix (runs AFTER audit produces findings)
> - `fold:mxit` = track the findings as tasks, coordinate fixes

## Phase 1: Setup

### Understand the codebase

Before planning waves, get oriented:

1. **Read the project structure** — `ls` the source directories, identify major subsystems
2. **Count files and lines** — know the scale. A 20-file project needs 2-3 waves. A 90-file project needs 10+.
3. **Read the entry points** — main server, CLI, init files. Understand the wiring.
4. **Check for existing tests** — test coverage tells you where the author WAS careful (and where they weren't)

### Ask about deployment context

Severity calibration depends on how the code is used. Ask the user:

> "How is this deployed? Local dev tool for 1-2 users? Production service? Multi-tenant? This changes which bugs matter."

- **Local single-user** → race conditions are theoretical, crashes on bad input are real
- **Production multi-user** → race conditions are real, everything is real
- Tag findings `#local-real` or `#at-scale-only` accordingly

### Create TASKS-AUDIT.md

```markdown
# [Project Name] — Correctness Audit

Full sweep of `[source dir]`. Findings only — no fixes applied. Created [date].

**Totals: 0 findings across 0 sweep waves**

> **Deployment context:** [what the user told you]
> Items marked `#local-real` affect every session regardless of scale.
> Items marked `#at-scale-only` only matter at scale/multi-user.

---

## P1 — High (fix before production use)

## P2 — Medium (address before sustained operation)

## Fix-First List

## Top Themes

## Stats
| Category | Count |
|----------|-------|
```

## Phase 2: Wave Planning

Plan all waves before launching the first one. The progression: **subsystems → deep dives → cross-cutting patterns → mop-up.**

### Waves 1-3: Subsystem Sweeps

Map the codebase into 3-4 subsystems per wave. Each agent gets a focused file list (5-10 files max). Cover the entire source directory systematically.

Example for a typical backend:

| Wave | Agent 1 | Agent 2 | Agent 3 | Agent 4 |
|------|---------|---------|---------|---------|
| 1 | Core engine / state | HTTP / API layer | Plugin / extension system | Config / bootstrap |
| 2 | External integrations | Business logic | Instance / session mgmt | CLI / commands |
| 3 | Background jobs | Data processing | Storage / persistence | Auth / permissions |

Adapt to whatever the actual project structure is. The principle: **each agent owns a coherent subsystem, no overlapping files between agents in the same wave.**

### Waves 4-6: Deep Dives

Return to trouble spots with fresh agents:
- **God objects** — any file >500 lines gets its own dedicated agent
- **Main wiring layer** — the file that connects everything (server.ts, mod.ts, app.py, main.go)
- **Process lifecycle** — startup, shutdown, error recovery, signal handling
- **The test suite itself** — test helpers, fixtures, disabled sanitizers, shared mutable state

### Waves 7-9: Cross-Cutting Sweeps

Shift from subsystem-based to pattern-based. Each agent greps for a specific anti-pattern across the entire codebase:

| Pattern | What to grep for | Why it matters |
|---------|-----------------|---------------|
| Error swallowing | `catch` blocks that return null/undefined/empty/log-only | Corrupt state becomes invisible |
| Non-atomic writes | File writes outside atomic-write helpers | Crash during write = corrupted file |
| Type safety escapes | `as any`, `as unknown as`, non-null assertions (`!`) | Type system bypassed = bugs hidden |
| Promise handling | `.then(` without `.catch(`, fire-and-forget promises | Unhandled rejections, silent failures |
| Timestamp consistency | Mixed time sources (wall clock vs injectable, string compare vs numeric) | Time bugs are subtle and hard to reproduce |
| Hardcoded values | Magic numbers, hardcoded paths, embedded credentials | Deployment fragility, security |
| Resource leaks | Open handles without cleanup, missing `finally` blocks, event listeners never removed | Memory leaks, file descriptor exhaustion |

### Waves 10+: Mop-Up

- Files not yet covered by any agent
- Type/interface contracts (the main types file)
- Error message quality and consistency
- Circular imports / dependency issues
- Final reconciliation across all prior findings

## Phase 3: Running Waves

### Launch agents in parallel

Each wave launches 3-4 agents simultaneously using the Agent tool. **All agents in a wave run in parallel** — use a single message with multiple Agent tool calls.

### Subsystem Agent Prompt Template

```
You are auditing [Project] for correctness issues. This is a READ-ONLY audit — do NOT modify any files.

Focus on these files:
- [list each file with full path]

Read each file carefully and completely. For each bug/issue found, report:
- A short title
- The exact file path and line number(s)
- What's wrong and why it matters
- Category: race-condition | resource-leak | error-handling | logic-bug | data-loss | security | ux | wiring | dead-code
- Scope: #local-real or #at-scale-only

EXCLUDE these previously found issues: [list all prior finding IDs like A001, A002...]

Look specifically for:
1. [Subsystem-specific concern]
2. [Subsystem-specific concern]
3. Error handling — are errors caught, logged, and recoverable?
4. Edge cases — what happens with empty input, null, concurrent access?
5. Wiring — is this code actually called from anywhere? Or is it dead?

Return findings as a numbered list:
**W[wave]-[seq]** Title — description `file.ts:123` #category #scope
```

### Cross-Cutting Agent Prompt Template

```
You are auditing [Project] for a specific anti-pattern: [PATTERN NAME]. READ-ONLY — do NOT modify files.

Search across the entire [source dir] for:
1. [grep pattern and what it means]
2. [grep pattern and what it means]
3. [grep pattern and what it means]

For each dangerous instance, report:
- What operation's error is being swallowed / what pattern is dangerous
- The exact file path and line number(s)
- What consequence this has (data loss? silent failure? crash?)
- Scope: #local-real or #at-scale-only

EXCLUDE previously found issues: [all prior IDs]

Return findings as:
**W[wave]-[seq]** Title — description `file.ts:123` #category #scope
```

### After Each Wave

1. **Collect** all agent results
2. **Assign sequential IDs** — A001, A002... continuing from last wave's highest ID
3. **Append** findings to TASKS-AUDIT.md under a wave header (`### Wave N — [focus]`)
4. **Classify** each finding as P1 (high) or P2 (medium) and file under the right section
5. **Update** the Fix-First List with any new critical findings (use tiers — see below)
6. **Update** the Top Themes section if new patterns emerged
7. **Update** the Stats table with category counts
8. **Update** the totals in the header
9. **Tell the user** what was found, key themes, and ask if they want to continue

### Finding Format

```markdown
- [!] **A042** Race in session write — two agents can write simultaneously with no lock `src/state.ts:234` #race-condition #local-real
- [ ] **A043** Auth middleware missing on admin route `src/api/admin.ts:12` #security #at-scale-only
```

- `[!]` = P1, high severity (affects every session or is a security issue)
- `[ ]` = P2, medium/low severity
- Always include `file:line`
- Always include `#category` and `#scope`

### Fix-First List Tiers

Organize the most critical findings by impact:

```markdown
**Tier 0 — Features that don't work (wiring never connected):**
**Tier 0.5 — Operations permanently stuck (no recovery path):**
**Tier 1 — Broken in every session:**
**Tier 2 — Data corruption / stuck states:**
**Tier 3 — Data loss / silent failures:**
```

## Phase 4: Handoff to mxit

When the audit is complete (all planned waves run, or user says stop):

1. **Write a summary** at the top of TASKS-AUDIT.md — total findings, top themes, recommended fix order
2. **The Fix-First List IS the task list** — it's already in mxit-compatible format (`- [ ]` / `- [!]`)
3. **The user can run `fold:mxit:run`** to start working through fixes, or `fold:playtest:improve` to have agents fix findings automatically
4. **Tag audit findings** with `#audit` so they're distinguishable from manually-added tasks

## Key Principles

1. **Exclusion lists prevent duplicate work** — every agent prompt MUST list all prior finding IDs. Without this, 40 agents will all report the same obvious bug.
2. **Read the actual code** — agents must `Read` files, not guess from names. Be explicit in prompts: "Read these files completely."
3. **File:line or it didn't happen** — every finding must have exact location. No "somewhere in the codebase."
4. **Calibrate severity to deployment** — a race condition in a local dev tool is theoretical. A crash on malformed input is real for everyone.
5. **One audit doc** — everything goes in TASKS-AUDIT.md. Don't scatter.
6. **Progressive depth** — early waves cast wide (subsystems), later waves go deep (patterns). This prevents tunnel vision.
7. **Themes > individual findings** — if 30 of 500 findings are "error swallowing," that's a systemic issue worth a paragraph, not just 30 line items.
8. **Know when to stop** — diminishing returns are real. If a wave produces <5 new findings, the audit is converging. Stop.

## Typical Findings by Category

Based on real audits across Deno/Node/Python codebases:

| Category | What it looks like | Frequency |
|----------|-------------------|-----------|
| **Error swallowing** | `catch → return null`, making corrupt state invisible | Very common |
| **Wiring failures** | Feature fully implemented + tested but never connected in init/server | Common |
| **Non-atomic writes** | File writes that corrupt on crash | Common |
| **Dead code** | Files with tests but no production imports | Common |
| **Race conditions** | Concurrent access without locks/queues | Moderate |
| **Type casts hiding bugs** | `as any` bypassing validation | Moderate |
| **Auth gaps** | Routes missing middleware | Less common but high severity |
| **Resource leaks** | Open handles, event listeners, timers never cleaned up | Moderate |
| **Timestamp chaos** | Mixed wall-clock vs injectable time | Moderate in larger codebases |

## Resuming an Audit

If continuing from a prior session:

1. Read the existing TASKS-AUDIT.md
2. Note the highest finding ID (e.g., A509)
3. Note which subsystems and patterns have been covered
4. Plan the next wave targeting uncovered areas
5. Continue with the full exclusion list + sequential IDs

## See Also

- `fold:playtest:explore` — lighter-weight open-ended discovery (one agent, quick)
- `fold:playtest:improve` — analyze→fix pipeline (use AFTER audit produces findings)
- `fold:mxit` — track findings as tasks, coordinate fixes
- `fold:mxit:run` — dispatch agents to work through the fix list
- `fold:autorefine` — iterative improvement loop (for refining a single artifact, not codebase-wide)
