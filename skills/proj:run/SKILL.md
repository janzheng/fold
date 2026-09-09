---
name: proj:run
disable-model-invocation: true
description: "Execute ready TASKS work, verify results, and update status."
---

# proj:run — Execute Tasks


## Lookup Cues

Former frontmatter detail, kept here so global lookup stays compact:

> Run mxit tasks — find ready work, dispatch agents (sequentially or fanned out in worktrees), review before marking done. Use when the user says "run tasks", "what's ready", "do the next task", "fan out", "dispatch agents", "proj:run", or wants to execute tasks from a TASKS file.

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
- No `#discovered` or `#needs-approval` tag; these hold work for explicit human review or approval
- No ancestor with any of these gates or an unmet dependency (children cannot bypass them)

`#needs:tag` requires at least one matching item and all matches must be `[x]`.
Missing targets block readiness. `#blocked-by:tag` blocks while a matching item
is `[ ]`, `[@]`, or `[!]`; a missing target does not block. Read the relevant
indexed task files, including dependency sources such as TASKS-MAP.md, before
deciding readiness. The bundled CLI needs these files passed explicitly via
repeatable `--context <file>`; it does not scan links or directories.

`[!]` tasks go first. Then `[ ]` in bullet order.

If a TICKET or BRIEF doc is linked (`-> BRIEF/foo.md`), read it — that's the context for the task.

## Step 2: Plan Execution

**Sequential (default, 1-2 tasks):** You do tasks one at a time. Use for:
- Tasks with side effects on each other
- Small tasks (faster than worktree overhead)
- When only 1-2 tasks are ready

**Coordinator mode (3+ ready tasks):** Use the full research → synthesis → waves pipeline:

### 2a. Research phase (parallel, read-only)

For each ready task, spawn a read-only research agent:

```
Agent(prompt: "Explore this task: '{task description}'.
  Report: what files need changing, what dependencies exist,
  what approach you'd take. Do NOT modify files.", subagent_type: "Explore")
```

Spawn all research agents in a **single message** for true parallelism. They read only — no conflicts possible.

### 2b. Synthesis (you, the coordinator)

Read all research reports. Then:

1. **Detect file conflicts:** Which tasks touch the same files?
   ```
   Task A: "Fix auth null pointer"      → auth.ts
   Task C: "Add refresh token support"  → auth.ts
   Task B: "Update API docs"            → docs/api.md
   Task D: "Fix CI pipeline"            → .github/workflows/
   ```

2. **Group into waves:**
   - Tasks touching the same files → serialize (same wave, sequential)
   - Independent tasks → parallelize (same wave, concurrent)
   ```
   Wave 1: [A, B, D] — A is serial (auth.ts), B+D parallel (independent)
   Wave 2: [C] — depends on A's changes to auth.ts
   ```

3. **Write implementation specs per task** — not "do the task" but specific instructions:
   ```
   "In auth.ts:42, add null check: if (!user) return null.
    Run tests in tests/auth_test.ts. Commit when green."
   ```

### 2c. Dispatch waves

Fan out Wave 1 agents with **synthesized specs** + worktrees:

```
Agent(prompt: "Implementation spec: {spec}. Do the work, commit, report.", isolation: "worktree")
Agent(prompt: "Implementation spec: {spec}. Do the work, commit, report.", isolation: "worktree")
```

Wait for Wave 1 to complete. Review and merge. Then dispatch Wave 2 (which can reference Wave 1's commits).

### 2d. Verify each wave (fresh-eyes)

After merging a wave, optionally spawn a fresh verification agent:

```
Agent(prompt: "Verify changes in [files]. Run tests. Try edge cases.
  Report: does it actually work? Do NOT read the implementer's explanation —
  judge only the code and test results.")
```

The verifier sees artifacts (code, tests, output), not arguments (agent's self-assessment).

### Concurrency rules

- **Read-only tasks** (research, analysis) — run in parallel freely
- **Write tasks** (implementation) — one at a time per file set
- **Verification** — can run alongside implementation on DIFFERENT file areas
- **Never poll agents** — they report when done

## Step 3: Work

For each task (whether you or a subagent):

1. Read the task description and any linked docs (BRIEF, TICKET)
2. Claim it as `[@session-owner]` using the [task claim rules](../proj:tasks/claims.md). Use the agreed shared task file, respect existing owners, and confirm the saved claim before work; assign distinct worker identities when fanning out.
3. Do the work
4. If you discover new work during execution, note it as sub-items with `#discovered`. Hold these and their descendants for human review. Remove `#discovered` only after the human accepts the scope; approval gates still apply. Optional follow-ups do not need execution to finish the original scope; retain them as held follow-ups when recording its verified completion.

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
**If review fails:** fix the issues, then re-review. After 2 failed attempts, mark `[!] #error=2 #error="what's wrong" #stuck` and move on. Preserve the attempt count across rescans and sessions. Do not clear `#stuck` automatically; resume only after human intervention. With the bundled CLI, use `fail --max-retries 2` on each failure (its standalone default is 3).

## Step 5: Mark Done

Update TASKS.md immediately (this is the #1 thing that gets forgotten):

```markdown
- [x] [done: what you actually did] Task description #tags
```

For failures:
```markdown
- [!] Task description #error="what went wrong"
```

This remains retryable. At the two-attempt limit, also record `#error=2 #stuck`.
Human approval is permission to execute, not completion: keep `[ ]` (or `[!]`),
record `[approved: reason]`, and remove `#needs-approval` after explicit approval.
Use `[x]` only after execution and verification.

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

For coordinator mode (with synthesized specs):
```
You are implementing this spec:

{synthesized implementation spec from step 2b}

Original task: {task description}
Context: {any linked BRIEF/TICKET content}

Do exactly what the spec says. Then report:
1. What you changed (files, approach)
2. Whether tests pass
3. Any discovered sub-tasks
```

For sequential mode (no synthesis):
```
You are working on this task from TASKS.md:

  - [ ] {task description}

Context: {any linked BRIEF/TICKET content}

Do the work, then report:
1. What you changed (files, approach)
2. Whether tests pass
3. Any discovered sub-tasks
```

## Recovery

Reconcile individual claims with their owners; age or an unfamiliar session name
does not prove a crash. Release only owned, stopped work or an explicitly authorized
handoff after confirming no worker remains active. Preserve unrelated claims.
The bundled `recover` command and `run` recovery step clear all claims without
liveness checks: do not use them on a shared queue. See the task claim rules above.

## CLI (Optional)

The CLI still works for manual state management:

```bash
mxit ready    TASKS.md [--json]               # Show ready tasks
mxit ready    TASKS-api.md --context TASKS-MAP.md --context TASKS-auth.md
mxit recover  TASKS.md                       # Exclusive/offline queue only; resets ALL claims
mxit claim    TASKS.md <line> --agent <name>   # Claim a task
mxit done     TASKS.md <line> --result "msg"   # Mark complete
mxit fail     TASKS.md <line> --error "msg" --max-retries 2
mxit validate TASKS.md                         # Check format
```

But the primary workflow is agent-driven — you read TASKS.md and orchestrate directly.
