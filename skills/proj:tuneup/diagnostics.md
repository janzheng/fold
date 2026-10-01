# Workflow diagnostics

Use only the questions relevant to the selected example. This is a diagnostic
reference, not a checklist to impose on every repository.

| Observed friction | Inspect | Small correction to consider |
|---|---|---|
| Agents repeatedly ask where to start | Root instructions, task index, actual entry points | Fix one missing or stale pointer |
| Work ends with unfinished integration | Acceptance outcome, affected boundaries, handoff evidence | Clarify who owns the final verification and add the missing check |
| Tests pass but the feature fails | What the check exercises versus the user's operation | Reproduce the missing boundary; retain useful existing coverage |
| Instructions conflict or drift | Authoritative source and its copies | Correct the source, update copies, remove ambiguity |
| Work lives in multiple competing queues | Existing task index and topic-file convention | Consolidate into the established queue and repair references |
| Every session reconstructs setup | Actual working command versus documented setup | Fix the command or document a verified minimal setup |
| Repeated agent review exchanges | Whether each pass adds evidence | Remove the redundant pass, retaining accountable integration |
| Process is growing faster than delivered work | Changes added beyond the agreed outcome | Defer optional process; test whether the smaller workflow suffices |

## Useful evidence

Prefer a concrete failed command, reproduction, stale reference, missed handoff,
or recorded intervention. User reports are valid starting evidence; distinguish
them from causes confirmed by inspection. Do not invent measurements or reconstruct
an incident as fact when logs are missing.

For a proposed change, identify the operation to repeat and the expected result.
Examples: the documented setup command runs; the task is reachable from the root
index; a missing integration check now detects the reproduced defect. A shorter
document alone does not prove that agents need less help.

If runtime access or credentials are missing, verify what is possible and state
the remaining boundary. Do not weaken checks to make the result look complete.

## Scope example

A repository keeps TASKS.md but new work was written into an unindexed todo.md.
Move those records into the existing task family, link them from its index, and
correct the instruction that created the competing queue. Verify records survived
and active references resolve. Do not replace the task system or reorganize
unrelated project documentation.

Inspiration: https://x.com/boringmarketer/status/2096220825401622701
Adapted into a bounded workflow; no claim of independently measured effectiveness.
