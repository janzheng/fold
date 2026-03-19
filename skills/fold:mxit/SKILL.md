---
name: fold:mxit
description: The complete mxit task system — set up TASKS.md, manage the TASKS family (TASKS-DESIGN.md, TASKS-MAP.md, TASKS-{area}.md), run the task runner, and coordinate multi-agent work. Markdown-native task lists with rich statuses, sub-items, tags, due dates, #needs dependencies, phased buildouts, decisions, risks, and agent coordination. The "track" facet of fold. Use when the user says "tasks", "todos", "mxit", "TASKS.md", "add a task", "mark done", "task list", "what's left to do", "set up tasks", "run tasks", "what's ready", "project map", "architecture map", "roadmap", "what blocks what", "dependencies", "vision", "decisions", "archive tasks", "clean up tasks", "garbage collect", "fold:mxit", or wants to track work items in a project.
---

# fold:mxit — Task Tracking & Orchestration

The **track** facet of fold. Set up and manage `TASKS.md` files, scale to the full TASKS family for bigger projects, and run the task lifecycle with multi-agent coordination.

> **Canonical repos:** This skill is the implementation layer. The canonical spec and parser live elsewhere:
> - **Spec:** `/Users/janzheng/Desktop/Projects/_deno/apps/mxit/MXIT_SPEC.md`
> - **Parser/CLI:** `/Users/janzheng/Desktop/Projects/_deno/apps/mxit/src/`
> - **fold (parent):** `/Users/janzheng/Desktop/Projects/_deno/apps/fold/`
> - **Skills (this repo):** `/Users/janzheng/Desktop/Projects/mcp-hub/skills/`

## Quick Setup

Create a `TASKS.md` in the project root:

```markdown
# Project Name

## Current

- [ ] First task
- [ ] Second task #tag -> 2026-03-31
  - [ ] Sub-task A
  - [ ] Sub-task B
```

For bigger projects (3+ areas), also suggest TASKS-MAP.md and TASKS-DESIGN.md — see **Scaling Up** below.

## Pairs with

- `/fold:playtest` — discoveries get emitted as mxit tasks with `#found`
- `/fold:autorefine` — too-big issues get emitted as mxit tasks with `#found #autorefine`
- `/fold:mxit:brainstorm` — speculative exploration (EXPLORE files) feeds into TASKS when committed
- `/fold` — the full loop: discover → track → improve → fold again

---

## Format Reference

### Statuses

Brackets describe **what the item IS** (human-meaningful):

```
- [ ] open          — not started, actionable
- [@] ongoing       — in progress (or [@agent-name] for multi-agent)
- [x] done          — completed
- [~] obsolete      — no longer relevant
- [?] in question   — needs discussion, not actionable
- [!] important     — needs attention, prioritize over [ ]
- [*] starred       — flagged / special note, informational
```

`[!]` means **important**, NOT error. Error state lives in tags.

Regex: `^(\s*)- \[([ x~@!?*])\]\s+(.+)$`

### Execution State Tags

Machine-readable state — separate from human-meaningful status:

- `#error` — failed on last attempt, eligible for retry
- `#error=N` — failed N times (runner increments)
- `#error="message"` — error detail from last failure
- `#stuck` — runner gave up after MAX_RETRIES, needs human intervention
- `#blocked-by:tag` — blocked until no open task has that tag
- `#needs:tag` — blocked until that tag's item is `[x]` (same semantics, used for architecture dependencies)

A task can be `[!]` important AND `#error` at the same time.

### Resolution Format

When completing or closing a task, add a bracket annotation after status:

```
- [x] [fixed: rewrote validation logic] Input validation was broken #bug
- [x] [done: added 3 test cases] Write edge case tests
- [~] [deferred: moving to Q3] OAuth PKCE support
- [?] [needs: design review] Should we support token rotation?
```

Format: `- [status] [keyword: short message] description #tags [timestamp]`

Keywords: `fixed`, `done`, `wontfix`, `deferred`, `needs`, `blocked`, or any short verb. Resolution bracket is optional.

### Format Rules

- Every item starts with `- ` then a checkbox: `- [ ] Do the thing`
- Sub-items indent 2 spaces per level (unlimited depth)
- Titles are markdown headings (`##`, `###`, etc.)
- Blank line between heading and items, blank line between groups
- Tags: `#tag` or `#tag=value` or `#tag="quoted value"`
- Due dates: `-> 2026-03-31`, `-> 2026-Q2`, `-> 2026-W12`, `-> 2026`
- Priority is **bullet order** (first = highest) plus `[!]` for attention. No numeric priority system.

### Ready Semantics

A task is **ready** (actionable) when ALL of:
- Status is `[ ]` or `[!]`
- No children are in `[ ]`, `[@]`, or `[!]` status (subtasks must finish first)
- No `#blocked-by:tag` where that tag exists on an open task
- No `#needs:tag` where that tag exists on a non-`[x]` item
- No `#stuck` tag

### Multi-Agent Claiming

Agent writes its name in the bracket:

```markdown
- [@claude-1] Refactor the auth module
- [@codex-2] Fix the parser bug
- [ ] Write tests (unclaimed)
```

No locking needed for 1-3 agents. Claims are advisory ("I'm here"), not locks.

#### Agent nicknames

When fanning out subagents, each picks a memorable `adjective-animal` name for itself:

```markdown
- [@bold-otter] Search API integration #search-api
- [@calm-fox] Background job queue #bg-jobs
- [@dry-hawk] CDN setup #cdn
```

Names are **ephemeral** — useful while agents are live, replaced by the resolution bracket when done:

```markdown
- [x] [done: Typesense integrated, 12 tests] Search API integration #search-api
```

The agent name disappears because it served its purpose. What matters after completion is what happened, not who did it.

### Discovery

When an agent finds new work during execution, nest under current task with `#discovered`:

```markdown
- [@claude-1] Fix the auth bug
  - [ ] Rate limiter doesn't count refresh tokens #discovered
  - [ ] Token expiry edge case on DST change #discovered
```

Discovered tasks are NOT auto-dispatched. They wait for human review.

### Archival

TASKS.md is RAM — it should stay short. When `[x]` items pile up, they need garbage collection.

**How to archive:**
- Move completed `[x]` and obsolete `[~]` items to `TASKS.done.md` (or `TASKS-{area}.done.md` for area files)
- Keep the `.done.md` file append-only — newest at the top, grouped by date or sprint
- Alternatively, use a `## Archive` section at the bottom of the same file (simpler but file grows)

**When to suggest archiving:**
- TASKS.md has 5+ completed items → suggest moving to TASKS.done.md
- An area file has 10+ completed items → suggest moving to its .done.md
- A phase in TASKS-MAP.md is fully `[shipped]` → it stays in MAP (that IS the archive)
- Decisions/risks in TASKS-DESIGN.md that are `[x] [decided]` or `[x] [resolved]` → stay (they're reference)

**Rules:**
- Never auto-archive — always ask the user first
- Preserve resolution brackets and timestamps when moving to .done.md
- The .done.md file is read-only history — don't edit old entries

### How to Write/Update TASKS.md

#### Creating a new TASKS.md

```markdown
# Project Name

## Group Name

- [ ] First task
- [ ] Second task #tag -> 2026-03-31
  - [ ] Sub-task A
  - [ ] Sub-task B
```

#### Updating task status

Change only the checkbox. Do NOT rewrite surrounding text:

- Mark done: `- [ ] Task` → `- [x] [done: what happened] Task`
- Mark ongoing: `- [ ] Task` → `- [@] Task` (or `- [@agent-name] Task`)
- Mark obsolete: `- [ ] Task` → `- [~] Task`
- Flag important: `- [ ] Task` → `- [!] Task`

#### Behavior

- **CRITICAL: Update TASKS.md after completing work.** After building, testing, or finishing any task, immediately mark it done in TASKS.md (or the relevant TASKS-{area}.md). Don't wait — do it as part of the same workflow. This is the #1 thing that gets forgotten.
- Preserve existing formatting, tags, and due dates when editing
- Don't reorder items unless explicitly asked
- Don't remove `[~]` obsolete items unless asked — they serve as history
- When reporting progress, summarize by status count (e.g. "3/7 done, 2 ongoing")
- When all sub-items of a parent are `[x]`, suggest marking the parent done — ask first

### Example

```markdown
# Auth Refactor

## Core

- [x] [done: extracted to auth/validation.ts] Extract token validation #auth #refactor
- [@bold-otter] Add refresh token support #auth #feature
  - [x] [done: designed rotation strategy] Design token rotation strategy
  - [@] Implement rotation endpoint
  - [ ] Handle edge case: expired refresh token
- [!] Fix race condition in concurrent token refresh #auth #bug #error="test timeout after 30s"
- [ ] Migrate legacy session tokens #auth #migration #error=3 #stuck

## Discovered During Work

- [ ] Rate limiter doesn't account for refresh token requests #discovered

## Post-Refactor

- [ ] Update API docs for new token endpoints #docs
- [~] [deferred: moving to Q3] Consider OAuth2 PKCE flow
- [*] Remember to check Redis config before deploy

## Archive

- [x] [done: found 12 direct references] Audit existing token usage [2026-03-13]
- [x] [done: created fixtures] Set up test fixtures for auth module [2026-03-13]
```

---

## Scaling Up: The TASKS Family

> **Progressive disclosure:** For small projects, ONLY read the Format Reference and Quick Setup above. Stop here. Everything below is for projects with 3+ areas, multiple phases, or multi-agent coordination. Don't add structure until the project needs it.

For larger projects, TASKS.md alone gets overwhelmed. The mxit format scales with three optional companion files. Add them only when the project outgrows a single file.

### The layers

```
TASKS-DESIGN.md     — why + how: mission, design, goals, decisions
TASKS-MAP.md        — what: architecture tree + phased buildout
TICKET/{name}.md    — delegation: scope, contracts, acceptance for a work chunk
REDUCE/{name}.md    — investigation: research boiled down to a recommendation
TASKS-{area}.md     — deep backlog per area (e.g. TASKS-ui.md)
TASKS.md            — now: the fridge list, what you're doing today
```

**TASKS.md** is always the fridge — short, curated, changes daily. The others add context for bigger projects.

**IMPORTANT:** All files use the `TASKS-` prefix with UPPERCASE naming: `TASKS-DESIGN.md`, `TASKS-MAP.md`, `TASKS-SECURITY.md`. Never lowercase (`tasks-security.md`). Even if the user says "tasks-security", normalize to `TASKS-SECURITY.md`. Do NOT create separate `VISION.md`, `DESIGN.md`, `MAP.md`, or `ROADMAP.md` files — everything lives in the TASKS family. `TASKS-DESIGN.md` IS the design doc. There is no separate vision or design document.

### TASKS-DESIGN.md — The 5 W's + How

The project's design document. Covers who, what, when, where, why, AND how. Do NOT create a separate `VISION.md` or `DESIGN.md` — this is it. The "read this first" doc for anyone (human or agent) joining the project.

```markdown
# ProjectName — Design

## Mission

One sentence. What this project exists to do.

## Who

Who is this for? 1-2 user types with their core need.

- [*] Data scientists — need to run experiments without DevOps overhead
- [*] Platform engineers — need to manage compute resources across teams

## What

What does it do? 2-3 sentences, plain language. Not features — outcomes.

## Why

Why does this exist? What problem triggered it? What's the alternative without it?

## How It Works

High-level system design. How the pieces fit together. A newcomer should read this and understand the architecture without reading code.

Keep it short — a few paragraphs, maybe a simple diagram. Not exhaustive (that's what the code is for). Just enough to orient someone: "data flows from X through Y to Z, the key abstraction is W."

Update this when the architecture changes meaningfully, not on every commit.

## Goals

- [x] Goal 1 — shipped, validated
- [@] Goal 2 — in progress
- [ ] Goal 3 — planned
- [?] Goal 4 — still deciding if we need this

## Team

Declare who's available — humans and agents. Use these names in `[@name]` claims.

- [*] @yawnxyz — human, product/design, final decisions, external tasks
- [*] @claude — AI agent, Claude Code, primary dev + planning
- [*] @codex — AI agent, Codex CLI, parallel coding tasks

Not everyone needs to be listed. Add as needed. The `@name` is what goes in `[@name]` when claiming tasks.

## Non-Goals

- [*] Thing we explicitly won't do — and why
- [*] Another boundary

## Decisions

Project-level calls. The resolution bracket captures the decision; the text after the dash captures why.

- [x] [decided: Postgres] Database engine — Mongo was considered but we need ACID transactions
- [x] [decided: JWT + refresh] Auth strategy — sessions too stateful for API-first architecture
- [?] Search engine — Elastic vs Typesense, waiting on load test results
- [~] [reversed: back to REST] GraphQL API — added complexity wasn't worth it

Lifecycle: `[?]` open question → `[x] [decided: choice]` settled → `[~] [reversed: reason]` if overturned.

## Risks

Project-level blockers and uncertainties. Not tasks — constraints that affect scheduling and strategy.

- [!] Legal hasn't signed off on data processing agreement — blocks Phase 2 launch
- [?] Stripe rate limits may hit us at scale — need load test before billing launch
- [*] Key person dependency: only Maria knows the billing reconciliation logic
- [x] [resolved: signed 2026-02-15] SOC2 compliance — was blocking enterprise sales
```

All sections are optional — use what fits. Small projects might just have Mission + How It Works + Goals. The full template is for projects where newcomers need real onboarding.

Updates rarely — when strategy shifts, architecture changes, decisions are made, or risks change. Area-specific decisions belong in the relevant TASKS-{area}.md file instead.

#### Decisions and Risks in area files

Area-level calls and risks live in the area file, not in DESIGN:

```markdown
# UI Tasks

## Decisions

- [x] [decided: React Hook Form] Form library — Formik too heavy, native too manual
- [?] Animation library — Framer Motion vs CSS transitions

## Risks

- [!] Signup wizard depends on unreleased API endpoint

## Auth Flows

- [@] Signup wizard #auth
  ...
```

### TASKS-MAP.md — Architecture, Dependencies & Phased Buildout

Bird's-eye view of the whole project: what exists, what depends on what, what can be worked in parallel, and what phase things ship in.

The key feature of TASKS-MAP is **structured dependencies** using `#needs:tag`. This turns the map from a flat list into a dependency graph that tells you what's parallelizable and what's blocked.

```markdown
# ProjectName — Map

## Phase 1: Foundation -> 2026-Q1 [shipped 2026-02-28]

### Backend

- [x] Database schema #db-schema
- [x] Auth endpoints #auth-api #needs:db-schema
- [x] Billing integration — Stripe #billing-api #needs:db-schema #needs:auth-api

### Frontend

- [x] Design system #design-system
- [x] Auth flows #auth-ui #needs:auth-api #needs:design-system

## Phase 2: Core Product -> 2026-Q2

### Backend

- [@] Search — Typesense #search-api #needs:db-schema `-> TASKS-api.md`
- [@] Background jobs — Sidekiq #bg-jobs #needs:db-schema `-> TASKS-api.md`
- [?] Webhooks — do customers need this? #webhooks #needs:auth-api

### Frontend

- [ ] Dashboard #dashboard-ui #needs:search-api #needs:design-system `-> TASKS-ui.md`
- [ ] Settings — team mgmt, billing portal #settings-ui #needs:billing-api #needs:design-system
  - [ ] Team invites #needs:auth-api
  - [ ] Billing portal #needs:billing-api

### Infrastructure

- [ ] CDN setup #cdn
- [@] Monitoring + alerting #monitoring `-> TASKS-infra.md`

## Phase 3: Scale -> 2026-Q3

### Backend

- [ ] Rate limiting #rate-limit #needs:auth-api #needs:search-api
- [ ] Multi-tenancy #multi-tenant #needs:db-schema #needs:auth-api

### Frontend

- [?] Dark mode — blocked on design decision #dark-mode #needs:design-system
- [ ] Mobile responsive pass #mobile #needs:dashboard-ui #needs:settings-ui
```

#### Dependencies with `#needs:tag`

Every MAP item can have an `#id` tag (just a bare `#tag`) and `#needs:tag` references:

```markdown
- [x] Database schema #db-schema
- [@] API layer #api #needs:db-schema
- [ ] Dashboard #dashboard #needs:api #needs:design-system
```

This means:
- **Dashboard** can't start until both **API** and **design system** are `[x]`
- **API** can't start until **database schema** is `[x]`
- If multiple items have no unmet `#needs`, they can be **worked in parallel**

Same semantics as `#blocked-by` on tasks, but applied to architecture items. The `#needs` tag explicitly answers "what blocks what" and "what can fan out."

#### Computing what's parallelizable

An item is **ready for work** when:
- All its `#needs:tag` references point to items that are `[x]`
- Its own status is `[ ]` or `[!]` (not already done or in question)

In the example above, after Phase 1 ships:
- **Search** and **Background jobs** are both ready (both only `#needs:db-schema` which is `[x]`) → **parallel**
- **Dashboard** is blocked (needs `#search-api` which is `[@]`, not done) → **wait**
- **CDN** and **Monitoring** have no `#needs` → **ready anytime**

This lets agents (or humans) look at the MAP and immediately know: "I can fan out search, bg-jobs, CDN, and monitoring simultaneously. Dashboard and settings have to wait."

#### Lanes — parallel workstreams within a phase

For very large phases, group parallel work into explicit lanes:

```markdown
## Phase 2: Core Product -> 2026-Q2

### Lane A: Data (can start immediately)

- [@] Search — Typesense #search-api #needs:db-schema
- [@] Background jobs #bg-jobs #needs:db-schema

### Lane B: UI (blocked until Lane A ships)

- [ ] Dashboard #dashboard-ui #needs:search-api
- [ ] Settings #settings-ui #needs:billing-api

### Lane C: Infra (independent)

- [ ] CDN setup #cdn
- [@] Monitoring #monitoring
```

Lanes are just organizational headings — the `#needs` tags are what actually define the graph. Lanes make it human-readable at a glance.

#### How phases work

- **Phase = a time-boxed chunk** — Q1, Q2, sprint, milestone, whatever fits
- **Sections within phases = areas or lanes**
- **Items = features/components** with mxit brackets + `#id` + `#needs:id` tags
- **`-> TASKS-{area}.md`** links to deep backlogs when an area has 5+ tasks

When a phase completes, add `[shipped DATE]` to the heading. The `[x]` items become the shipping record — no separate changelog needed.

#### Cross-phase dependencies

Items in later phases can reference items from earlier phases:

```markdown
## Phase 2
- [ ] Search API #search-api #needs:db-schema

## Phase 3
- [ ] Rate limiting #rate-limit #needs:search-api
```

This makes it explicit why Phase 3 can't start certain items until Phase 2 ships specific things.

#### Bracket meanings in MAP context

Same statuses, applied to **features/areas**:

```
- [ ] open       — planned, not started
- [@] ongoing    — actively being built
- [x] done       — shipped, stable
- [~] obsolete   — deprecated or cut
- [?] in question — needs decision before work starts
- [!] important  — something's wrong, needs attention
- [*] starred    — notable info
```

### TASKS-{area}.md — Area Backlogs

Standard mxit format. Same rules as TASKS.md. Scoped to one area:

```markdown
# UI Tasks

## Auth Flows

- [x] [done: built with form validation] Login page #auth
- [@] Signup wizard #auth
  - [x] Step 1: email + password
  - [@] Step 2: profile info — validation broken
  - [ ] Step 3: team setup
- [ ] Password reset flow #auth

## Dashboard

- [ ] Metrics cards — revenue, users, churn #dashboard
- [ ] Chart components — line, bar, pie #dashboard
```

Only create area files when an area has enough active work (5+ tasks). Small areas stay inline in TASKS-MAP.md.

### REDUCE — Deep Dive Documents

When a task is too complex to just implement, someone needs to investigate first — spike on an architecture, debug a gnarly issue, research approaches, sketch a design. The result is a **REDUCE doc**: the investigation boiled down to a concentrated recommendation.

REDUCE docs are the bridge between "we need to figure this out" and "go do the thing." They capture the thinking so it survives the conversation and any agent picking up the task gets full context.

#### Where they live

```
REDUCE/                         — folder for projects with multiple deep dives
REDUCE/unified-retrieval.md     — one doc per investigation
REDUCE/auth-race-condition.md
```

For small projects, `REDUCE-{name}.md` alongside TASKS files works too.

#### Shape

```markdown
# Unified Retrieval Layer

**Status:** ready | wip | abandoned
**From:** conversation / playtest / debugging / spike
**Task:** `-> TASKS.md` (link to the task that will implement this)

## Problem

What prompted the investigation. 2-3 sentences max.

## Investigation

What you found. The deep dive content — research, analysis, prototyping results, alternate approaches considered. This is the bulk of the doc.

## Recommendation

The concluded design, fix, or approach. Clear enough that someone who wasn't in the original conversation can understand and implement it.

## Implementation Sketch

Enough detail that an agent can execute without the original conversation context. Interface sketches, migration steps, key files to change, edge cases to handle.
```

#### How tasks link to REDUCE docs

```markdown
- [ ] Unified retrieval layer `-> REDUCE/unified-retrieval.md` #arch
- [ ] Fix auth race condition `-> REDUCE/auth-race-condition.md` #bug
```

The task is thin — the REDUCE doc has all the context. The agent reads the doc, then implements.

#### Status lifecycle

- **wip** — investigation ongoing, not ready to implement
- **ready** — recommendation is clear, task can be picked up
- **abandoned** — investigation concluded that the approach won't work (keep for future reference)

When the linked task is completed, the REDUCE doc stays as documentation of the decision. Archive it with the task if needed.

#### When to write a REDUCE doc

- Architecture changes that need a design sketch first
- Bugs that require investigation before fixing
- Features where multiple approaches were evaluated
- Any time an agent or human does significant thinking that a future agent would need

#### When NOT to write one

- Simple tasks where the implementation is obvious
- Tasks where the TASKS description is sufficient context
- Quick fixes that don't need a design phase

#### REDUCE vs EXPLORE

| | EXPLORE | REDUCE |
|---|---------|--------|
| **Phase** | Before commitment | After investigation |
| **Content** | Multiple paths, open questions | One recommendation, concluded |
| **Promotes to** | TASKS-DESIGN (strategy) | TASKS (actionable work) |
| **Tone** | "Should we...?" | "Here's how, go build it" |
| **Metaphor** | Sketchbook | Reduced sauce — concentrated essence |

Both are upstream of TASKS, but EXPLORE is speculative and REDUCE is conclusive. An EXPLORE exercise might identify that you need a REDUCE spike on a specific topic.

### TICKET — Delegation Slips

When you're handing a big chunk of work to a subagent (or a new team member, or future-you after a break), a ticket is the order slip — like a kitchen ticket that tells the line cook what to make, what it goes with, and any special notes.

Tickets answer: "what do you own, what can't you break, and how do we know it's done?"

#### Where they live

```
TICKET/                     — folder for projects with multiple
TICKET/auth-rewrite.md      — one per major work chunk
TICKET/phase-2.md
```

Or `TICKET-{name}.md` alongside TASKS files. Always UPPERCASE.

#### Shape

```markdown
# Auth Rewrite — Ticket

**Scope:** Own the auth module rewrite. Don't touch billing or the session store — that's Phase 3.
**Builds on:** `src/core/auth.ts`, `src/core/types.ts`. Tests use existing harness in `src/tests/`.
**Contracts:** `refreshToken()` signature — billing depends on it. `User` type — 4 other modules import it. Change these = break downstream.
**Done when:** All existing auth tests pass + 10 new tests. Token refresh works under concurrent access. No regression in login flow.

## Deviations

> Filled after work ships. What changed and why.
```

Four fields + a post-hoc section. That's it.

- **Scope** — what you own, what you don't. "You may be tempted to also do X — don't."
- **Builds on** — key files, prior art, assumptions. What exists that you can rely on.
- **Contracts** — interfaces other phases/agents depend on. Break these = break downstream.
- **Done when** — concrete acceptance criteria. No judgment calls.
- **Deviations** — filled AFTER work ships. What changed from the ticket and why. This is the institutional memory.

#### How tasks link to tickets

```markdown
- [ ] Auth rewrite `-> TICKET/auth-rewrite.md` #auth #phase-2
```

#### When to write a ticket

- Delegating 10+ tasks to a subagent across multiple areas
- Work has interface boundaries other phases depend on
- Multiple agents working on the same phase in parallel
- Coming back to a project after a long break

#### When NOT to write one

- Small feature, one agent, obvious scope — just use TASKS.md
- Everything fits in TASKS-MAP sub-items
- No interface contracts to protect

#### TICKET vs REDUCE

| | REDUCE | TICKET |
|---|--------|--------|
| **Job** | Investigation → recommendation | Delegation → safe execution |
| **Answers** | "What should we build and why?" | "How do you build it without breaking everything else?" |
| **Written** | After research/spike concludes | Before delegating a work chunk |
| **Core content** | Problem, investigation, recommendation | Scope, contracts, acceptance criteria |
| **Post-hoc** | — | Deviations section |

A REDUCE might feed into a TICKET. The REDUCE figures out the approach, the TICKET packages the delegation context. But either can exist without the other.

### Rules for the family

1. **TASKS-DESIGN.md** = source of truth for **why + how** — mission, system design, goals, decisions & risks
2. **TASKS-MAP.md** = source of truth for **structure + dependencies + shipping** — what exists, what blocks what, what can fan out
3. **TICKET/{name}.md** = source of truth for **delegation** — scope, contracts, acceptance criteria for a major work chunk
4. **TASKS-{area}.md** = source of truth for **depth** — all tasks in an area, plus area-level decisions & risks
5. **TASKS.md** = source of truth for **priority** — what to work on RIGHT NOW
6. **Don't duplicate** — a task lives in ONE place. TASKS.md uses soft references to other files (e.g. "See TASKS-api.md for search details"), not copies. Like legal citations — "as described in Section 4.2"
7. **Dependencies are explicit** — use `#needs:tag` in TASKS-MAP so blocking relationships are visible, not buried in prose
8. **Decisions live where they have context** — project-level in DESIGN, area-level in area files
9. **"How It Works" stays high-level** — DESIGN explains architecture, code explains implementation
10. **Completed phases are the changelog** — `[shipped DATE]` on the heading, `[x]` items are the record
11. **Design updates rarely** — strategy shifts, architecture changes, decisions made, risks changed
12. **Map updates on milestones** — features ship, new areas appear, phases complete
13. **Tickets are written once, deviated post-hoc** — the deviations section is the value
14. **Area files are backlogs** — comprehensive, not urgent
15. **TASKS.md updates daily** — the working surface

### When to scale up

| Signal | Add |
|--------|-----|
| Project has a mission or design worth writing down | TASKS-DESIGN.md |
| 3+ distinct areas (UI, API, infra, data) | TASKS-MAP.md |
| An area has 5+ tasks | TASKS-{area}.md |
| Multiple phases or milestones planned | Phases in TASKS-MAP.md |
| Can't tell what blocks what | `#needs:tag` dependencies in TASKS-MAP.md |
| Multiple agents/people need to fan out | Lanes in TASKS-MAP.md |
| TASKS.md is mixing concerns | Split into area files |
| A task needs investigation before implementing | REDUCE/{name}.md |
| Delegating a big chunk with interface contracts | TICKET/{name}.md |

### When NOT to scale

- Small project, one area → just TASKS.md
- Everything fits on one page → don't add structure for structure's sake
- Early exploration → map is for projects with known shape
- Dependencies are obvious → don't add `#needs` tags to every item; only when blocking relationships aren't clear from context

---

## Task Runner

Run the mxit task lifecycle: recover crashed tasks, find ready work, claim and dispatch, mark done or failed.

### CLI Tool

A Deno CLI is bundled in `scripts/cli.ts`. Run directly or install globally:

```bash
# Run directly
deno run --allow-read --allow-write scripts/cli.ts <command> <file> [options]

# Install globally (then use `mxit` anywhere)
deno install --global --allow-read --allow-write --name mxit scripts/cli.ts
```

#### Commands

```
mxit ready    <file> [--json]               Show ready (actionable) tasks
mxit validate <file>                         Check format for errors
mxit claim    <file> <line> --agent <name>   Claim a task for an agent
mxit done     <file> <line> [--result <msg>] Mark task complete
mxit fail     <file> <line> --error <msg>    Mark task failed
mxit recover  <file>                         Reset crashed [@] tasks to [ ]
mxit run      <file>                         Full loop: recover → ready → show
```

### Runner Lifecycle

#### 1. Recover crashed tasks

If a previous session died mid-work, `[@]` tasks are orphaned. Reset them:

```bash
mxit recover TASKS.md
```

Always run on startup.

#### 2. Find ready tasks

```bash
mxit ready TASKS.md
```

Ready semantics apply (see above). `[!]` tasks are prioritized over `[ ]` tasks.

#### 3. Claim → Work → Done/Fail

```bash
# Claim
mxit claim TASKS.md <line> --agent bold-otter

# ... do the work ...

# Success
mxit done TASKS.md <line> --result "rewrote validation logic"

# Failure
mxit fail TASKS.md <line> --error "timeout after 30s"
```

**On done:** Sets `[x]`, adds `[done: message]` resolution, removes `#error`/`#stuck` tags.

**On fail:** Sets `[ ]`, increments `#error=N`, adds `#error="message"`. After 3 failures, adds `#stuck`.

### Which Files to Run

The runner operates on **TASKS.md** and **TASKS-{area}.md** files. These contain actionable work.

**TASKS-MAP.md** and **TASKS-DESIGN.md** are NOT run — they're slower-moving documents that humans update. However, `#needs:tag` references in task files can point to MAP items, so the runner resolves those tags across all TASKS files when computing readiness.

### Full Automation Loop

```bash
# 1. Recover any crashed tasks
mxit recover TASKS.md

# 2. Check what's ready
mxit ready TASKS.md --json

# 3. For each ready task: claim → work → done/fail
mxit claim TASKS.md 15 --agent bold-otter
# ... do the work ...
mxit done TASKS.md 15 --result "implemented the feature"

# 4. Repeat until no ready tasks remain
mxit ready TASKS.md
```

For multi-file projects, check area files too:

```bash
mxit ready TASKS-ui.md --json
mxit ready TASKS-api.md --json
```

### Parser Library

The `scripts/` folder contains a full TypeScript parser library:

- `parse.ts` — `parseTasks(markdown)` → Task[] with full nesting, tags, due dates, resolution brackets, annotations
- `serialize.ts` — `serializeTasks(tasks)` → markdown; `applyTasks(original, tasks)` → preserves non-task lines
- `validate.ts` — `validateFormat(markdown)` → finds malformed brackets, bad indentation, orphan subtasks
- `ready.ts` — `getReady(tasks)` → filters for actionable tasks respecting children, blocked-by, stuck
- `fileops.ts` — `claimTask()`, `completeTask()`, `failTask()`, `resetCrashed()`, `addDiscoveredTask()`

See [references/SPEC.md](references/SPEC.md) for the full formal specification.

### Policy File

Projects can include an optional `MXIT.md` in the root with:
- Agent identity and project context
- Conventions (e.g. "run tests before marking done")
- Runner config (max-retries, max-concurrent, default-timeout)

Defaults work without it.
