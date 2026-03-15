---
name: fold:autorefine
description: Set up autonomous refinement in a project — negotiate a rubric with the user, then iterate (modify → judge → keep/discard) until quality converges. The "improve" facet of fold. Use when the user says "fold:autorefine", "set up autorefine", "add refinement loop", or wants iterative improvement without the full fold loop.
---

# fold:autorefine — Improvement

The **improve** facet of fold. Set up and run the autorefine loop on any artifact.

For the full autorefine protocol, see `/autorefine`. This skill focuses on getting autorefine into a project quickly.

## Quick setup

No files needed — autorefine works on any existing artifact. The process:

1. Agree on a rubric with the user (scored or comparative mode)
2. Baseline the current state
3. Loop: modify → judge → keep/discard
4. Stop when quality converges

Big issues that can't be fixed in-loop get emitted to `TASKS.md` with `#found #autorefine`.

## When to use fold:autorefine alone

- You know something could be better but aren't sure how — the rubric negotiation forces clarity
- You want iterative improvement on a specific artifact (skill, doc, config)
- You don't need discovery (playtest) — you already know what to improve

## Pairs with

- `/fold:playtest` — playtest findings tell you what to autorefine
- `/fold:mxit` — too-big issues get emitted as mxit tasks
- `/fold` — the full loop: discover → track → improve → fold again
