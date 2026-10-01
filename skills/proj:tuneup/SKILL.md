---
name: proj:tuneup
disable-model-invocation: true
description: "Fix recurring development-workflow friction, not system architecture."
---

# Project tune-up

Find and fix demonstrated friction in the path from an agreed task to a complete,
verified change. This is an occasional workflow improvement pass. Use
`proj:checkpoint` for record updates and `proj:audit` for a code-defect sweep.
Use `proj:agent-ready` for a systematic pass on the system's architecture,
interfaces, observable state, and recovery. This pass starts from friction in
getting work completed, not from an agent's ability to operate the product.

## Start with evidence

Read the project instructions, task index, and relevant lessons first. Choose one
recent feature, incident, or handoff that required unnecessary intervention.
Use the user's example when provided. Otherwise inspect recent work for one
concrete problem; if none is evident, report that rather than inventing process.

State the observable outcome, affected workflow, and stopping condition. Follow
the relevant path through the product, code, setup, tests, and CI; inspect other
layers only when needed to understand that path. For diagnostic questions and
examples, load [diagnostics.md](diagnostics.md) only for the relevant symptom.

## Make a bounded improvement

1. Show the evidence of friction and its cause. Separate demonstrated blockers
   from optional improvements and hypotheses.
2. Select the smallest useful correction within the request. Prefer fixing or
   consolidating existing commands, instructions, tests, or ownership boundaries.
   Check existing code and suitable integrations before creating infrastructure.
3. Implement when a tune-up is requested. An explicitly read-only review stays
   read-only. Do not expand into a repository rewrite or product redesign.
4. Replay the affected operation or run the relevant checks. Trace necessary
   interface/backend/persistence/worker/service boundaries for that operation;
   state which were exercised and which remain unverified.
5. Stop once the scoped outcome is sufficiently verified. Use `proj:checkpoint`
   to update the existing task record and retain any reusable lesson. Park optional
   follow-ups only when useful, with a concrete trigger for revisiting them.

## Working constraints

- Follow the repository's existing task file names and index. In a TASKS-based
  repo, use `TASKS.md` or its established `TASKS-*.md` topic files, never a parallel
  `todo.md`. Preserve prior records and fix links when consolidating them.
- Keep main agent instructions short: product purpose, important locations,
  critical boundaries, and verification commands. Link detailed guidance and
  load it only when relevant. Avoid duplicated sources of truth.
- New process needs a demonstrated problem. Do not create a skill for every fix.
- Keep one owner responsible for integration. Delegate bounded independent work
  only when it reduces total effort; avoid recursive delegation and review loops
  that produce no new evidence.
- Match checks to risk. Remove protective checks only with evidence that their
  protection is obsolete, redundant, or ineffective. Measure before/after for
  performance claims; do not infer gains from cleaner-looking code.
- If an approach repeatedly fails, investigate the cause and change direction.
- Preserve user changes and existing permissions. A tune-up does not authorize
  merging, deploying, or expanding the agreed scope.

## Result

Report the friction addressed, what changed, observed verification, and remaining
blockers. Explicitly identify untested boundaries. No-change is a valid outcome
when the existing workflow already meets the goal.
