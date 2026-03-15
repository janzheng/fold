---
name: mxit
description: Manage TASKS.md files using the mxit format — markdown-native task lists with rich statuses, sub-items, tags, due dates, and multi-agent coordination. Use when the user says "tasks", "todos", "mxit", "TASKS.md", "add a task", "mark done", "task list", "what's left to do", or wants to track work items in a project.
---

# mxit — Markdown Task Management

Manage `TASKS.md` files using the mxit format: markdown-native task lists with statuses, sub-items, tags, due dates, and agent coordination.

## CLI Tool

A Deno CLI is bundled in `scripts/cli.ts`. Run directly or install globally:

```bash
# Run directly
deno run --allow-read --allow-write scripts/cli.ts <command> <file> [options]

# Install globally (then use `mxit` anywhere)
deno install --global --allow-read --allow-write --name mxit scripts/cli.ts
```

### Commands

```
mxit ready    <file> [--json]               Show ready (actionable) tasks
mxit validate <file>                         Check format for errors
mxit claim    <file> <line> --agent <name>   Claim a task for an agent
mxit done     <file> <line> [--result <msg>] Mark task complete
mxit fail     <file> <line> --error <msg>    Mark task failed
mxit recover  <file>                         Reset crashed [@] tasks to [ ]
mxit run      <file>                         Full loop: recover → ready → show
```

Use `mxit ready --json` for machine-readable output. Use `mxit validate` to catch format errors before they cause problems.

## Statuses

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

## Execution State Tags

Machine-readable state — separate from human-meaningful status:

- `#error` — failed on last attempt, eligible for retry
- `#error=N` — failed N times (runner increments)
- `#error="message"` — error detail from last failure
- `#stuck` — runner gave up after MAX_RETRIES, needs human intervention
- `#blocked-by:tag` — blocked until no open task has that tag

A task can be `[!]` important AND `#error` at the same time.

## Resolution Format

When completing or closing a task, add a bracket annotation after status:

```
- [x] [fixed: rewrote validation logic] Input validation was broken #bug
- [x] [done: added 3 test cases] Write edge case tests
- [~] [deferred: moving to Q3] OAuth PKCE support
- [?] [needs: design review] Should we support token rotation?
```

Format: `- [status] [keyword: short message] description #tags [timestamp]`

Keywords: `fixed`, `done`, `wontfix`, `deferred`, `needs`, `blocked`, or any short verb. Resolution bracket is optional.

## Format Rules

- Every item starts with `- ` then a checkbox: `- [ ] Do the thing`
- Sub-items indent 2 spaces per level (unlimited depth)
- Titles are markdown headings (`##`, `###`, etc.)
- Blank line between heading and items, blank line between groups
- Tags: `#tag` or `#tag=value` or `#tag="quoted value"`
- Due dates: `-> 2026-03-31`, `-> 2026-Q2`, `-> 2026-W12`, `-> 2026`
- Priority is **bullet order** (first = highest) plus `[!]` for attention. No numeric priority system.

## Ready Semantics

A task is **ready** (actionable) when ALL of:
- Status is `[ ]` or `[!]`
- No children are in `[ ]`, `[@]`, or `[!]` status (subtasks must finish first)
- No `#blocked-by:tag` where that tag exists on an open task
- No `#stuck` tag

## Multi-Agent Claiming

Agent writes its name in the bracket:

```markdown
- [@claude-1] Refactor the auth module
- [@codex-2] Fix the parser bug
- [ ] Write tests (unclaimed)
```

No locking needed for 1-3 agents. For more, have the runner assign tasks.

## Discovery

When an agent finds new work during execution, nest under current task with `#discovered`:

```markdown
- [@claude-1] Fix the auth bug
  - [ ] Rate limiter doesn't count refresh tokens #discovered
  - [ ] Token expiry edge case on DST change #discovered
```

Discovered tasks are NOT auto-dispatched. They wait for human review.

## Archival

Completed tasks can be archived when the file gets long:
- **Option A:** `## Archive` section at bottom of same file
- **Option B:** Separate `TASKS.done.md` file

User decides when to archive. Don't auto-archive.

## How to Write/Update TASKS.md

### Creating a new TASKS.md

```markdown
# Project Name

## Group Name

- [ ] First task
- [ ] Second task #tag -> 2026-03-31
  - [ ] Sub-task A
  - [ ] Sub-task B
```

### Updating task status

Change only the checkbox. Do NOT rewrite surrounding text:

- Mark done: `- [ ] Task` → `- [x] [done: what happened] Task`
- Mark ongoing: `- [ ] Task` → `- [@] Task` (or `- [@agent-name] Task`)
- Mark obsolete: `- [ ] Task` → `- [~] Task`
- Flag important: `- [ ] Task` → `- [!] Task`

### Behavior

- Preserve existing formatting, tags, and due dates when editing
- Don't reorder items unless explicitly asked
- Don't remove `[~]` obsolete items unless asked — they serve as history
- When reporting progress, summarize by status count (e.g. "3/7 done, 2 ongoing")
- When all sub-items of a parent are `[x]`, suggest marking the parent done — ask first

## Parser Library

The `scripts/` folder contains a full TypeScript parser library:

- `parse.ts` — `parseTasks(markdown)` → Task[] with full nesting, tags, due dates, resolution brackets, annotations
- `serialize.ts` — `serializeTasks(tasks)` → markdown; `applyTasks(original, tasks)` → preserves non-task lines
- `validate.ts` — `validateFormat(markdown)` → finds malformed brackets, bad indentation, orphan subtasks
- `ready.ts` — `getReady(tasks)` → filters for actionable tasks respecting children, blocked-by, stuck
- `fileops.ts` — `claimTask()`, `completeTask()`, `failTask()`, `resetCrashed()`, `addDiscoveredTask()`

See [references/SPEC.md](references/SPEC.md) for the full formal specification.

## Example

```markdown
# Auth Refactor

## References

- Backend API: `backend/TASKS.md`
- Design doc: `design/auth-redesign.md`

## Core

- [x] [done: extracted to auth/validation.ts] Extract token validation #auth #refactor
- [@claude-1] Add refresh token support #auth #feature
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
