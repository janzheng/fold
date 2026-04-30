---
name: fold:mxit:brief
description: Concentrate one investigation, conversation, spike, or research thread into a single design doc with a clear recommendation that an executor can act on. **Single-topic, single-moment, points forward at execution** — NOT for tracking work over time (that's `/journal`). Use when the user says "fold:mxit:brief", "brief this", "write a brief doc", "write a brief", or "deep dive doc" — or after an investigation has concluded and the thinking needs to survive the conversation in a form a future agent can pick up and execute against.
---

# fold:mxit:brief — Boil It Down

A brief concentrates messy inputs from **one** investigation — tweets, research notes, conversation history, debugging session, architecture spike — into a single design doc with a clear recommendation. The doc becomes the context for one task: "go implement what's in here."

## The shape of a brief

- **Single topic.** One investigation, one decision, one design. If you're capturing five different things, that's not a brief — that's a journal week.
- **Single moment.** Written when the thinking has converged. Not a living document. Not updated daily.
- **Points forward at execution.** The reason it exists is to hand off context to whoever (or whatever) will build the thing. Once the work ships, the brief is archive.
- **Has a recommendation.** No recommendation = it's not done yet. "We should consider..." belongs in EXPLORE.
- **Has an executor in mind.** Even if that executor is future-you, write it as if they don't have your context.

If you find yourself updating the same brief over weeks, you wanted a journal — a series of dated entries leading to a fresh brief once conclusions formed.

## When to write a brief

- An investigation or spike concluded and the findings need to survive the conversation
- A task is too complex to just implement — it needs a design doc the executor can read first
- Multiple inputs (tweets, research, links, conversation history) need to be distilled into one recommendation
- A future agent will pick up a task and needs the original context without joining the original conversation

## When NOT to write a brief

- **Tracking what's happening over time** — that's `/journal`. Briefs don't grow; journal entries accumulate.
- **Open exploration** — multiple paths, "should we?" — that's EXPLORE (`fold:mxit:explore`).
- **A single decision log** — a one-line "we decided X because Y" goes in `.journal/` as a `type: decision` entry, not a brief.
- **A pile of cross-cutting notes** — that's a journal entry or a notes file, not a brief.
- **Something you'll keep amending as you learn** — write journal entries first; promote to a brief once thinking has converged.

## Brief vs Journal vs EXPLORE

| | EXPLORE | JOURNAL | BRIEF |
|---|---------|---------|--------|
| **Question** | "Should we?" | "What did we think?" | "Here's how" |
| **Time-shape** | Speculative — multiple paths | Time-series — dated entries | Single moment — frozen |
| **Updated over time** | Yes, while exploring | No — append new entries instead | No — write a new brief if thinking shifts |
| **Has a recommendation** | No, multiple paths | No, just observations | Yes, one |
| **Audience** | Self / collaborator brainstorming | Future-you | Executor (agent, teammate, future-you) |
| **Lives in** | `EXPLORE-{topic}.md` | `.journal/YYYY-MM-DD-<slug>.md` | `.brief/<slug>.md` |
| **Lifecycle** | Promote ideas into TASKS or DESIGN | Append-only | Archive once executed |

## Where it lives

```
.brief/                         — folder (always — even with one doc)
.brief/unified-retrieval.md     — one doc per topic
.brief/auth-race-condition.md
```

Always use the dotfolder — keeps project root clean. **No date prefix on filenames.** If you're tempted to date a brief filename, you wanted a journal entry.

## Shape

```markdown
# {Title — descriptive, names the topic}

**Status:** wip | ready | abandoned
**From:** {where the inputs came from — conversation, tweets, research, debugging}
**Task:** `-> TASKS.md` {link to the task that will implement this, if one exists}

## Problem

What prompted this. 2-3 sentences.

## Sources

Links, tweets, docs, conversations that were boiled down. Breadcrumbs back to the raw material.

## Investigation

What you found. The bulk of the doc — analysis, comparisons, prototyping results, alternate approaches considered and why they were rejected.

## Recommendation

The concluded design, fix, or approach. Clear enough that someone who wasn't in the original conversation can understand and act on it.

## Implementation Sketch

Enough detail for an agent to execute: interface sketches, migration steps, key files to change, edge cases to handle. Optional for early-stage briefs.
```

## Status lifecycle (one-way, bounded)

- **wip** — actively writing, not yet ready to hand off. Should resolve in days, not weeks. If `wip` lingers, the brief was the wrong shape — switch to journal entries.
- **ready** — recommendation is clear, an executor can pick it up.
- **abandoned** — investigation concluded the approach won't work. Keep for reference.

There is no "in progress forever" state. A brief that won't converge is a journal in disguise.

## Link from TASKS

```markdown
- [ ] Unified retrieval layer `-> .brief/unified-retrieval.md` #arch
```

The task is thin — the BRIEF doc has all the context.

## Workflow

1. **Gather inputs** — user provides tweets, notes, links, or says "brief what we just discussed"
2. **Read and synthesize** — find the signal in the noise
3. **Write the BRIEF doc** — problem, investigation, recommendation
4. **Optionally create a task** — link it to the doc with `-> .brief/...`
5. **Done** — the thinking survives the conversation, frozen at this moment
6. **When the work ships** — the brief is archive. Don't reopen it; if a new investigation is needed, write a new brief and link the old one as superseded.

## Common drift signals (you wanted a journal, not a brief)

- "Let me append today's findings to the existing brief..." → write a journal entry instead
- "Let me update the recommendation to reflect what we learned..." → write a *new* brief; mark the old one `[abandoned: superseded by .brief/X.md]`
- "Let me consolidate this week's notes into the brief..." → those notes belong in `.journal/`; the brief gets written once, after thinking converges
- "I've been keeping a brief on the auth refactor for two months..." → that should have been a journal series, with a final brief written at hand-off time

## See also

- `/fold:mxit` — full BRIEF reference + TASKS family docs
- `/fold:mxit:explore` — upstream exploration (EXPLORE files)
- `/journal` — time-series lab notebook for record-keeping over time
