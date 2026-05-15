---
name: fold:mxit:explore
description: "Capture and develop ideas in EXPLORE files, from quick stray thoughts to brainstorms and product specs that may become tasks."
---

# fold:mxit:explore — Capture, Explore, Brainstorm


## Lookup Cues

Former frontmatter detail, kept here so global lookup stays compact:

> Capture and explore ideas at three levels — silent spark drop (one-line stray thought, no session), quick explore (short note to EXPLORE.md), or full brainstorm session. Saves to EXPLORE.md / EXPLORE-{area}.md, promotes to TASKS family when ready. Use when the user says "spark this", "drop this", "park this idea", "stray thought", "have a thought", "save to explore", "note for later", "explore", "brainstorm", "what should we build", "zoom out", "PRD", "jobs to be done", "alternate paths", "career goals", "life planning", "coach me", or wants to capture an idea — from a one-line hunch to a full product spec.

Three modes from lightest to heaviest. **Default to the lightest mode that matches the user's intent. Never escalate to a session unless the user explicitly asks for one.** The cost of running an interrogation when they just wanted to drop a thought is high.

**This skill is for thinking, not implementing.** You may read files and investigate code, but never write code or implement features here. If the user wants to implement, remind them to start `fold:mxit:change` or add to TASKS.md.

## Mode 1 — Spark drop (DEFAULT)

Triggers: "spark this", "drop this", "park this idea", "stray thought", "quick thought", "have a thought", "capture this"

- Append a single dated bullet to `EXPLORE.md` (or `EXPLORE-{area}.md` if the user named an area)
- The user's words, lightly cleaned. ONE line.
- No questions. No expansion. No "would you like me to…"
- Done.

```
- [2026-04-30] What if briefs auto-collapsed sections older than 30 days?
- [2026-04-30] Underproof's cursor sync might solve the sketchnote problem
```

This is the default for ambiguous "I just had a thought." Drop it and move on. The user will ask for more if they want it.

## Mode 2 — Quick explore (short note, maybe one question)

Triggers: "save to explore", "note for later", "explore X" (with a topic)

- Write 1-3 sentences to `EXPLORE.md` or `EXPLORE-{area}.md`
- Capture context the user might forget — what triggered it, what it's adjacent to
- ONE clarifying question max, only if the entry would be incomprehensible without it
- No exercises, no JTBD, no personas

## Mode 3 — Full brainstorm (timeboxed session)

Triggers: "brainstorm X", "let's brainstorm", "PRD", "JTBD", "what should we build", "zoom out", "alternate paths", "coach me", "career goals", "life planning"

Run a structured exercise with the user, distill the output. Four core moves:

- **Five Whys** — ask "why?" until you find the real motivation
- **Alternate Paths** — generate 3 approaches with pros/cons
- **Jobs To Be Done** — situation → motivation → outcome
- **Coach Mode** — for non-product goals (career, creative, life)

See `exercises.md` next to this skill for full prompts and examples.

Timebox 15-30 min. Output goes to `TASKS-DESIGN.md` (committed direction) or `EXPLORE-{area}.md` (alternates kept alive).

## EXPLORE.md — The Sketchbook

EXPLORE files are NOT part of the TASKS family. Nothing here is committed work.

```
EXPLORE.md              — sparks, general exploration, alternate directions
EXPLORE-{area}.md       — topic-specific (EXPLORE-UI.md, EXPLORE-CLI.md, etc.)
```

Two kinds of content live here:

- **Sparks** — dated one-liners, append-only. Don't reorganize, don't promote unless the user asks. Most die quietly — that's the point.
- **Sketches** — structured exploration from a brainstorm session (Path A / Path B / decisions).

Always UPPERCASE, like the TASKS family.

### Re-read habit

Borrowing from Steven Johnson's spark file: the value of a spark isn't the moment of capture — it's re-reading old sparks months later and noticing one suddenly fits the current moment. Re-read EXPLORE.md when starting a new phase or feeling stuck.

### Promoting to TASKS

When the user commits to a direction:

1. Chosen path → flesh out as `TASKS-DESIGN.md` (mission, goals, decisions)
2. Unchosen paths stay in EXPLORE as `[~] [deferred:]` or untouched
3. Specific items can move to `TASKS.md` or `TASKS-MAP.md`

EXPLORE → TASKS is one-way. Don't demote committed tasks back; use `[~] [deferred:]` in TASKS-DESIGN.md instead.

### When EXPLORE leads to BRIEF

If exploration surfaces "we should do X" but X needs investigation before it can become tasks, that's a BRIEF doc — see `/fold:mxit:brief`.

EXPLORE asks "should we?" — BRIEF answers "here's how."

## What NOT to Do

- Don't ask "what would you like to do with this idea?" for a spark. Just append.
- Don't run JTBD/persona exercises unless the user explicitly invoked brainstorm mode.
- Don't try to organize sparks into themes. Chronological only.
- Don't promote sparks to TASKS automatically — always user-initiated.
- Don't put uncommitted exploration in TASKS files.
- Don't brainstorm forever — 15-30 min timebox, then distill or save.
- Don't skip exploration and jump straight to TASKS-MAP.md — you'll build the wrong thing efficiently.
