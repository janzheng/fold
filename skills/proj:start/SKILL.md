---
name: proj:start
description: "Choose the right project workflow when the user is unsure where to start."
---

# Proj: Start Here

Infer the intended outcome from the request and current project context. If the
user names a `proj:*` skill, use it directly. Otherwise choose the smallest
workflow that completes the request; do not make the user learn the menu.

## Choose by outcome

| Intended result | Use |
|---|---|
| Develop or park an idea before committing to work | `proj:explore` |
| Turn settled thinking into an execution handoff | `proj:brief` |
| Add, prioritize, claim, or update planned work | `proj:tasks` |
| Execute ready tasks | `proj:run` |
| Fan out bounded work while retaining integration ownership | `proj:delegate` |
| Reconcile records, next steps, and scope after meaningful work | `proj:checkpoint` |
| Save one lasting, atemporal finding | `proj:note` |
| Record dated reasoning, decisions, attempts, or surprises | `proj:journal` |
| Collect external links, articles, or repositories with notes | `proj:research` |
| Record a test, experiment, benchmark, or operation and its result | `proj:runlog` |
| Create, trial, revise, or retire a repeatable project procedure | `proj:sop` |
| Consult or save a reusable gotcha | `proj:lessons` |
| Record meaningful completed behavior and its impact | `proj:changelog` |
| Trace one known bug, error, or failing test | `proj:debug` |
| Sweep broadly for unknown code defects or security issues | `proj:audit` |
| Use the product to find bugs or awkward UX | `proj:playtest` |
| Assess how much better a user experience could be | `proj:11star` |
| Review agent instruction files for conflicts or wasted context | `proj:instruction-audit` |
| Fix recurring development-workflow friction | `proj:tuneup` |
| Assess or refactor architecture and interfaces for agent operation | `proj:agent-ready` |

Read and follow only the selected installed skill. If it is unavailable, state
that briefly and use the closest project convention without inventing its rules.
Some requests naturally form a short sequence, such as explore then brief or
debug then changelog; use multiple skills only when the requested outcome truly
requires each one.

Distinguish nearby intents by the artifact or evidence the user wants, not by a
keyword alone. A shared link is research when it should be collected, explore
when the user wants to think with it, and tasks only after work is agreed. A
completed implementation can need checkpoint reconciliation without qualifying
for a changelog entry.

Say which workflow you selected and why in one short sentence, then perform it.
Do not return to this router after the specialist finishes, and do not turn a
request for guidance into permission to edit, commit, release, or deploy.
