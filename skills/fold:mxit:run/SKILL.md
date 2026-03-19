---
name: fold:mxit:run
description: Run mxit tasks — find ready work, dispatch agents (sequentially or fanned out in worktrees), review before marking done. Use when the user says "run tasks", "what's ready", "do the next task", "fan out", "dispatch agents", "mxit:run", or wants to execute tasks from a TASKS file.
---

# mxit:run — Execute Tasks

You ARE the runner. Read TASKS.md, find what's ready, do the work (or fan out subagents), review, mark done. No CLI needed — you orchestrate directly.

## The Loop

```
1. FIND    — scan TASKS.md for ready tasks
2. PLAN    — decide: sequential (you do it) or fan-out (subagents in worktrees)
3. WORK    — do the task or dispatch subagents
4. REVIEW  — self-review: does it actually work?
5. MARK    — update TASKS.md: [x] [done: what happened] or [!] #error="what failed"
6. REPEAT  — check for newly-ready tasks (completed work may unblock others)
```

## Step 1: Find Ready Tasks

Read TASKS.md (and any TASKS-{area}.md files). A task is **ready** when:

- Status is `[ ]` or `[!]`
- No pending children
- No unmet `#needs:tag` or `#blocked-by:tag`
- No `#stuck` tag

`[!]` tasks go first. Then `[ ]` in bullet order.

If a TICKET or REDUCE doc is linked (`-> REDUCE/foo.md`), read it — that's the context for the task.

## Step 2: Plan Execution

**Sequential (default):** You do tasks one at a time. Use for:
- Tasks with side effects on each other
- Small tasks (faster than worktree overhead)
- When only 1-2 tasks are ready

**Fan-out (parallel subagents in worktrees):** Use for:
- 3+ independent ready tasks with no shared dependencies
- Tasks in different areas (UI + API + infra)
- Large tasks that benefit from isolation

To fan out, use the Agent tool with `isolation: "worktree"` for each task. Spawn all independent agents in a **single message** for true parallelism.

```
Agent(prompt: "Do task X. When done, report what you did.", isolation: "worktree")
Agent(prompt: "Do task Y. When done, report what you did.", isolation: "worktree")
Agent(prompt: "Do task Z. When done, report what you did.", isolation: "worktree")
```

Each agent gets an isolated copy of the repo. No conflicts.

## Step 3: Work

For each task (whether you or a subagent):

1. Read the task description and any linked docs (REDUCE, TICKET)
2. Claim it: mark `[@]` or `[@agent-name]` in TASKS.md
3. Do the work
4. If you discover new work during execution, note it as sub-items with `#discovered`

## Step 4: Review Gate

After work completes, self-review before marking done:

```
Ask yourself:
- Does the code compile / run without errors?
- Did I actually solve the task, not just adjacent things?
- Are there tests? Do they pass?
- Would I be confident handing this to someone who checks?
```

**If review passes:** proceed to mark done.
**If review fails:** fix the issues, then re-review. If stuck after 2 attempts, mark `[!] #error="what's wrong"` and move on.

## Step 5: Mark Done

Update TASKS.md immediately (this is the #1 thing that gets forgotten):

```markdown
- [x] [done: what you actually did] Task description #tags
```

For failures:
```markdown
- [!] Task description #error="what went wrong"
```

## Step 6: Repeat

After completing a task, re-scan for ready tasks. Completed work may unblock downstream tasks via `#needs:tag`. Keep going until:
- No ready tasks remain
- User tells you to stop
- You hit a task that needs human input (`[?]`)

## Fan-Out Details

When fanning out subagents in worktrees:

1. **Brief each agent** — include the task description, relevant context, and file paths
2. **One task per agent** — don't overload a single subagent
3. **Merge results** — when agents complete, their worktree branches need merging. Review each branch's changes before merging to main.
4. **Mark done from main** — update TASKS.md on the main branch after merging

### Agent prompt template

```
You are working on this task from TASKS.md:

  - [ ] {task description}

Context: {any linked REDUCE/TICKET content}

Do the work, then report:
1. What you changed (files, approach)
2. Whether tests pass
3. Any discovered sub-tasks
```

## Recovery

If a previous session died mid-work (orphaned `[@]` tasks):
- Reset crashed tasks: `[@]` → `[ ]` (remove the agent claim)
- Or use the CLI: `mxit recover TASKS.md`

Always check for orphaned claims before starting a run.

## CLI (Optional)

The CLI still works for manual state management:

```bash
mxit ready    TASKS.md [--json]               # Show ready tasks
mxit recover  TASKS.md                         # Reset crashed [@] → [ ]
mxit claim    TASKS.md <line> --agent <name>   # Claim a task
mxit done     TASKS.md <line> --result "msg"   # Mark complete
mxit fail     TASKS.md <line> --error "msg"    # Mark failed
mxit validate TASKS.md                         # Check format
```

But the primary workflow is agent-driven — you read TASKS.md and orchestrate directly.
