---
name: mxit:run
description: Run the mxit task runner — recover crashed tasks, find ready work, claim/complete/fail tasks, and orchestrate multi-agent workflows. Use when the user says "run tasks", "what's ready", "claim task", "recover crashed", "dispatch agents", or wants to automate task execution from a TASKS.md file.
---

# mxit Runner — Task Orchestration

Run the mxit task lifecycle: recover crashed tasks, find ready work, claim and dispatch, mark done or failed. For format reference, use the `/mxit` skill.

## Quick Start

```bash
# See what's actionable
mxit ready TASKS.md

# Full recovery + ready check
mxit run TASKS.md

# JSON output for programmatic use
mxit ready TASKS.md --json
```

## Runner Lifecycle (5 steps)

### 1. Recover crashed tasks

If a previous session died mid-work, `[@]` tasks are orphaned. Reset them:

```bash
mxit recover TASKS.md
```

This finds all `[@...]` tasks and resets them to `[ ]`. Always run on startup.

### 2. Find ready tasks

```bash
mxit ready TASKS.md
```

A task is ready when:
- Status is `[ ]` or `[!]`
- No pending children (`[ ]`, `[@]`, `[!]`)
- No `#blocked-by:tag` where that tag exists on an open task
- No `#stuck` tag

`[!]` tasks are prioritized over `[ ]` tasks.

### 3. Claim a task

```bash
mxit claim TASKS.md <line> --agent claude-1
```

Changes `- [ ] Task` → `- [@claude-1] Task`. The agent name in the bracket signals who owns it.

### 4. Do the work

The agent executes the task. Use annotations for guidance:

```markdown
- [ ] Add input validation #feature
  <!-- test: deno test api_test.ts -->
  <!-- accept: all edge cases handled -->
  <!-- timeout: 5m -->
  <!-- budget: $0.50 -->
```

### 5. Mark done or failed

```bash
# Success
mxit done TASKS.md <line> --result "rewrote validation logic"

# Failure
mxit fail TASKS.md <line> --error "timeout after 30s"
```

**On done:** Sets `[x]`, adds `[done: message]` resolution, removes `#error`/`#stuck` tags.

**On fail:** Sets `[ ]`, increments `#error=N`, adds `#error="message"`. After 3 failures (configurable with `--max-retries`), adds `#stuck` — task stops being retried and needs human intervention.

## Multi-Agent Orchestration

For 1-3 agents, just have each claim unclaimed ready tasks:

```markdown
- [@claude-1] Refactor the auth module
- [@codex-2] Fix the parser bug
- [ ] Write tests (unclaimed — next agent takes it)
```

Last write wins on races. The loser re-reads and picks something else.

For more agents, use serial dispatch: one coordinator reads the file, assigns tasks, then agents execute in parallel.

## Discovery

When an agent finds new work during a task:

```bash
# Programmatically (via the library):
# addDiscoveredTask(filePath, parentLine, "Found a new issue", ["auth"])
```

This nests a `- [ ] Found a new issue #discovered #auth` under the parent task. Discovered tasks are NOT auto-dispatched — they wait for human review.

## Validate Before Running

```bash
mxit validate TASKS.md
```

Catches malformed brackets, odd indentation, and orphan subtasks before they cause parser issues.

## Full Automation Loop

```bash
# 1. Recover any crashed tasks from previous session
mxit recover TASKS.md

# 2. Check what's ready
mxit ready TASKS.md --json

# 3. For each ready task: claim → work → done/fail
mxit claim TASKS.md 15 --agent claude-1
# ... do the work ...
mxit done TASKS.md 15 --result "implemented the feature"

# 4. Repeat until no ready tasks remain
mxit ready TASKS.md
```

## Policy File

Projects can include an optional `MXIT.md` in the root with:
- Agent identity and project context
- Conventions (e.g. "run tests before marking done")
- Runner config (max-retries, max-concurrent, default-timeout)

Defaults work without it.
