---
name: fold:mxit:brief
description: Create BRIEF docs — boil down research, tweets, messy notes, conversations, or deep dives into a concentrated design doc that a task can point to. Use when the user says "fold:mxit:brief", "brief this", "write a brief doc", "write a brief", or "deep dive doc".
---

# fold:mxit:brief — Boil It Down

Take messy inputs — tweets, research notes, conversation threads, debugging sessions, architecture spikes — and boil them down into a concentrated doc with a clear recommendation. The doc becomes the context for a task: "go implement what's in here."

## When to Use

- You have a pile of inputs (tweets, notes, links, conversation history) and need to distill them
- An investigation or spike concluded and the findings need to survive the conversation
- A task is too complex to just implement — it needs a design doc first
- You want to capture "here's how" so a future agent can execute without the original context

## Create a BRIEF Doc

### Where it lives

```
.brief/                         — folder (for projects with multiple)
.brief/unified-retrieval.md     — one doc per topic
.brief/auth-race-condition.md
```

Always use the dotfolder — keeps project root clean.

### Shape

```markdown
# {Title}

**Status:** ready | wip | abandoned
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

### Status

- **wip** — still investigating, not ready to act on
- **ready** — recommendation is clear, a task can be created or picked up
- **abandoned** — investigation concluded the approach won't work (keep for reference)

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
5. **Done** — the thinking survives the conversation

## BRIEF vs EXPLORE

- **EXPLORE** asks "should we?" — speculative, multiple paths, most ideas die
- **BRIEF** answers "here's how" — conclusive, one recommendation, ready to execute

An EXPLORE exercise might identify a topic that needs a BRIEF spike. But BRIEF also works standalone — someone dumps tweets and says "brief this," no brainstorming needed.

## See also

- `/fold:mxit` — full BRIEF reference + TASKS family docs
- `/fold:mxit:brainstorm` — upstream exploration (EXPLORE files)
