---
name: proj:checkpoint
description: "Update work records and check scope after meaningful work or before handoff."
---

# Checkpoint

Keep the project record aligned with actual work. Run after a meaningful task,
verified experiment, consequential decision, or before a context handoff.
Skip trivial edits and repeated checkpoints with no new information.

1. Read the current task and linked brief, plus relevant project conventions.
   Verify completion against the actual result; keep partial work open.
2. Update the existing task record, affected brief status, and newly unblocked
   work. Update a task's status line in place; add history to the linked brief or
   log, not the task entry. Limit the sweep to what this work touched. Preserve
   historical reasoning and mark superseded claims visibly rather than silently
   rewriting them.
   Respect session owners: do not reset or complete another session's claimed
   task without an agreed handoff and evidence; age alone is not a crash signal.
3. Capture only evidence worth retaining, using the project's existing locations:
   - Measured attempt: `proj:runlog` (success, failure, blocked, or incomplete).
   - Non-obvious reasoning, alternatives, surprises: `proj:journal` (lab notes).
   - Reusable trap or prevention: `proj:lessons`.
   - Meaningful completed behavior, compatibility, or maintenance change:
     `proj:changelog`, once for the bounded work, using its evidence and release
     rules. Skip routine internal edits; update matching Unreleased entries.
   Link the records; do not repeat the same narrative across them. Changelog
   writing returns here without starting another checkpoint or a release action.
4. Compare current work with the agreed launch outcome or task boundary. Name
   any scope added since agreement. State what can ship without it and what
   evidence would justify doing it later. Flag material expansion before acting;
   continue routine choices within the agreed scope. Do not invent a launch goal
   for open-ended research or brainstorming.
When a workflow trial finishes or correction/handoff friction recurs, use
`workflow-review` if available to assess actual effectiveness and the smallest
useful revision. Skip no-evidence passes; fold the result into this checkpoint
without a recursive review or automatic shared-skill rewrite.

5. Report completed work, unresolved blockers, and the next useful action briefly.
   This is not a request to stop, commit, push, merge, archive, or deploy.

Before starting the next task, read relevant existing lessons/gotchas by symptom
or component. Use their current applicability and evidence, not obsolete advice.

## Automatic use

Install the short [standing instruction](standing-instruction.md) in the agent's
normal project or global instruction file when enabling this workflow. The
instruction triggers this skill during active work; no daemon or timer is needed.
Do not load all companion skills or scan every project at session start.
