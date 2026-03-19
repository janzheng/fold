---
name: fold:mxit:reduce
description: Create REDUCE docs — boil down research, tweets, messy notes, conversations, or deep dives into a concentrated design doc that a task can point to. Use when the user says "fold:mxit:reduce", "reduce this", "write a reduce doc", or "deep dive doc".
---

# fold:mxit:reduce — Boil It Down

Take messy inputs — tweets, research notes, conversation threads, debugging sessions, architecture spikes — and reduce them into a concentrated doc with a clear recommendation. The doc becomes the context for a task: "go implement what's in here."

## When to Use

- You have a pile of inputs (tweets, notes, links, conversation history) and need to distill them
- An investigation or spike concluded and the findings need to survive the conversation
- A task is too complex to just implement — it needs a design doc first
- You want to capture "here's how" so a future agent can execute without the original context

## Create a REDUCE Doc

### Where it lives

```
REDUCE/                         — folder (for projects with multiple)
REDUCE/unified-retrieval.md     — one doc per topic
REDUCE/auth-race-condition.md
```

Or `REDUCE-{name}.md` alongside TASKS files for smaller projects. Always UPPERCASE.

### Shape

```markdown
# {Title}

**Status:** ready | wip | abandoned
**From:** {where the inputs came from — conversation, tweets, research, debugging}
**Task:** `-> TASKS.md` {link to the task that will implement this, if one exists}

## Problem

What prompted this. 2-3 sentences.

## Sources

Links, tweets, docs, conversations that were reduced. Breadcrumbs back to the raw material.

## Investigation

What you found. The bulk of the doc — analysis, comparisons, prototyping results, alternate approaches considered and why they were rejected.

## Recommendation

The concluded design, fix, or approach. Clear enough that someone who wasn't in the original conversation can understand and act on it.

## Implementation Sketch

Enough detail for an agent to execute: interface sketches, migration steps, key files to change, edge cases to handle. Optional for early-stage reduces.
```

### Status

- **wip** — still reducing, not ready to act on
- **ready** — recommendation is clear, a task can be created or picked up
- **abandoned** — investigation concluded the approach won't work (keep for reference)

## Link from TASKS

```markdown
- [ ] Unified retrieval layer `-> REDUCE/unified-retrieval.md` #arch
```

The task is thin — the REDUCE doc has all the context.

## Workflow

1. **Gather inputs** — user provides tweets, notes, links, or says "reduce what we just discussed"
2. **Read and synthesize** — find the signal in the noise
3. **Write the REDUCE doc** — problem, investigation, recommendation
4. **Optionally create a task** — link it to the doc with `-> REDUCE/...`
5. **Done** — the thinking survives the conversation

## REDUCE vs EXPLORE

- **EXPLORE** asks "should we?" — speculative, multiple paths, most ideas die
- **REDUCE** answers "here's how" — conclusive, one recommendation, ready to execute

An EXPLORE exercise might identify a topic that needs a REDUCE spike. But REDUCE also works standalone — someone dumps tweets and says "reduce this," no brainstorming needed.

## See also

- `/fold:mxit` — full REDUCE reference + TASKS family docs
- `/fold:mxit:brainstorm` — upstream exploration (EXPLORE files)
