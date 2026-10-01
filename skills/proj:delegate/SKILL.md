---
name: proj:delegate
description: "Delegate bounded tasks to agents with chosen models; keep integration here."
---

# Delegate

Keep this conversation as coordinator and integration owner. Delegate parts of
the agreed task, not responsibility for the outcome. `proj:run` still owns TASKS
queue execution; this skill adds no queue, scheduler, or mandatory audit pass.

## Choose useful assignments

Identify independent work worth delegating. Keep urgent dependent work local
when dispatch would only put the coordinator on the waiting path. Small tasks
may be faster to complete directly; explain that briefly instead of creating
a team for its own sake. Do not repeat a worker's investigation in parallel.

## Worker preferences

Respect per-run model choices first. The user's preferred worker provider is
Codex, whether the coordinator is Claude or Codex. Do not dispatch Codex-to-Claude
or substitute Anthropic workers unless the user explicitly requests it.

Choose by how much independent judgment the assignment needs. These are starting
preferences for GPT-6 workers, not measured rankings on Jan's projects:

| Assignment | Starting worker |
|---|---|
| Clear brief, established repo pattern, bounded implementation or fix, tests, repeatable tool procedure | Luna at xhigh; use medium for mechanical work |
| Cross-module diagnosis, integration, research that needs interpretation, or design within an existing system | Sol at medium or high; xhigh for demanding review |
| Ambiguous goal, conflicting constraints, novel architecture or visual direction, or a consequential decision spanning several systems | Astra at medium or high; xhigh when synthesis is especially demanding |

For design work, route an exact component change or implementation from an
approved design to Luna; a new screen needing product judgment to Sol; a new
direction or system that reconciles competing references, workflows, and
constraints to Astra. Visual polish alone does not require Astra. **Never select
Astra ultra automatically.** Jan must explicitly choose it for that assignment.
You may suggest it for exceptional synthesis where several hard constraints
interact and a weak decision would cause substantial rework, such as defining a
new product-wide design system from conflicting evidence. Give the reason, then
leave the choice to Jan. Without that explicit choice, use Astra xhigh or lower.
Check the selected host's effort names; do not assume its top setting is ultra.

Start with the smallest worker likely to meet the stated checks. Escalate when
the task reveals an unresolved tradeoff, repeated misses despite clear feedback,
or a need to reconcile broader context. A large file count or many tool calls
alone does not call for Astra. A focused task can still merit Astra when its
decision is unusually subtle or consequential. Earlier Sol-for-all-coding and
Terra-for-research defaults are superseded by these preferences.

Resolve exact model IDs and supported effort settings from current tools.
Explicit per-run choices override defaults. If a default is unavailable, use
the closest available Codex worker and disclose the substitution; ask before
changing an explicitly requested model or provider. Do not override
higher-priority model restrictions. Revisit these defaults as real runs provide
evidence. [OpenAI model selection](https://developers.openai.com/api/docs/guides/model-selection)
is a starting point, not a substitute for Jan's observed results.

## Dispatch a bounded brief

Give each worker the outcome, relevant files and decisions, explicit write scope
or read-only boundary, verification, and stop condition. Include essential project
conventions and permissions even with fresh context. Prefer focused context for
narrow jobs; inherit history only when earlier decisions materially matter.

Default workers to leaves: complete the assignment directly, do not spawn agents.
Use disjoint write ownership or an established worktree setup for parallel edits;
do not let multiple workers modify shared files concurrently. Reuse an existing
worker when its context helps, and respect actual concurrency/resource limits.

For tracked work, the coordinator publishes claims in the agreed shared TASKS
file before dispatch, following [task claim rules](../proj:tasks/claims.md).
Give each worker a distinct owner label; inherited parent session IDs are not
worker identities. Keep shared-queue updates with one writer when worktrees differ.

Use native delegation when it supports the requested worker. For cross-provider
execution, use an existing configured bridge such as `brigade:run`, after checking
its current schema, provider/model, working directory, isolation, permissions,
and result/status controls. A prompt saying read-only is not a sandbox. Do not
enable auto-approval, bypass restrictions, start remote machines, install another
runner, or broaden access just to make dispatch work. Report an unavailable route.

When supported, workers send relevant dependency findings directly to affected
workers and notify the coordinator. Include concise evidence or file references;
otherwise relay through the coordinator. Messages do not change task ownership,
expand scope, or authorize extra work.

Track the dispatched jobs and do non-overlapping work while they run. Consume
completion notifications where available; otherwise wait or poll as the backend
requires without busy loops. On a user stop or scope change, stop/reconcile the
affected workers before more edits; disclose any job that cannot be cancelled.
Preserve work already written; a stop request does not authorize rollback or
continued integration.

## Integrate and finish

Require concise results: findings or files changed, verification evidence,
unresolved questions, and blockers. Read the actual artifacts, resolve conflicts,
and run checks appropriate to the combined change. Worker success messages alone
do not prove integration. Follow up on a specific gap rather than launching
unbounded review or retry loops.

Finish only after required jobs are terminal and the agreed outcome is verified,
or report the concrete blocker and outstanding job state. Update the existing
TASKS records for implementation work; read-only work stays read-only. Report
what was delegated, the result, and unverified boundaries without dumping transcripts.

Inspiration: [Eric Provencher's multi-agent orchestration article](https://x.com/pvncher/status/2080707291603407077).
Adapted to the user's cross-model workflow; backend details and availability vary.
