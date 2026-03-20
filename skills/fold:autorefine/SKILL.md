---
name: fold:autorefine
description: Autonomous refinement loop — the "improve" facet of fold. Agent — agent and user agree on what "better" means, then the agent iterates (modify → compare → keep/discard → repeat) until quality converges. Use when the user says "autorefine", "refine this", "make this better", "iterate on this", "keep improving", "optimize this", or wants an autonomous improvement loop on code, docs, skills, or any artifact.
---

# autorefine — Autonomous Refinement Loop

Make something better through iteration. You and the user agree on what "better" means, then you loop: make one change, judge whether it helped, keep or discard, repeat.

The hard part isn't the loop — it's agreeing on what "better" means. Sometimes it's measurable (test pass rate, line count). Sometimes it's subjective (does this feel clearer? would an agent follow this?). Both are valid. You figure out which one together before touching anything.

## Phase 1: Agree on What "Better" Means

**This is mandatory. Do not skip this. Do not assume what "better" means.**

### The interrogation

Before making any changes, have a conversation with the user. Ask:

1. **What are you refining?** (a file, a skill, a CLI, an API, a doc)
2. **What does "better" feel like to you?** Not a formula — a vibe. "Clearer." "Less confusing." "An agent would actually follow this." Push for specifics but accept that some answers are subjective.
3. **What DOESN'T matter?** (performance is fine, don't touch the API surface, style is irrelevant)
4. **How would you know if it got worse?** This is often easier to answer than "what's better." "If it got longer without getting clearer." "If it lost a concept." "If an agent would get confused."
5. **Can we measure it, or do we taste it?** This determines the grading mode.

Push back on vague answers, but don't demand false precision. "Make it better" needs more clarity. "Make it so an agent reading this for the first time knows what to do at every step" is specific enough — even though it's subjective.

### Two grading modes

#### Scored mode — when you CAN measure it

Use when criteria are concrete and independently assessable: test pass rates, line counts, benchmark numbers, coverage percentages. Each criterion gets a numeric score, weighted, totaled.

```markdown
# Rubric: API error handling
## Mode: scored
## Criteria
1. Coverage — every endpoint returns structured errors (40%)
2. Specificity — errors include what went wrong and how to fix it (30%)
3. Consistency — all errors use the same format (20%)
4. No 500s — unhandled exceptions are caught (10%)
## Grading: score each 1-5, weighted total. Keep if improves, discard if drops.
```

#### Comparative mode — when you TASTE it

Use when quality is subjective — skills, docs, prompts, UX, anything where the right answer is "I know it when I see it." No numeric scores. Instead: read the old version and the new version side by side, pick which one you'd rather have, and say why.

This is the wine taster. A wine taster can't give you a formula, but they CAN tell you:
- "This is worse than yesterday's batch" (comparative judgment)
- "The acidity is off" (identify which dimension shifted)
- "Something broke that was working before" (regression detection)

```markdown
# Rubric: autorefine SKILL.md
## Mode: comparative
## Guardrails (must not regress)
- Still self-contained — no unexplained jargon
- Still actionable — agent knows what to do at every step
- Not longer unless justified
- No contradictions
## Direction (what "better" feels like)
- Fewer "wait, what?" moments
- Fewer words for the same idea
- Hard parts feel concrete, not abstract
- An agent would more likely follow this correctly
## How to judge: read old vs new. Which would you rather be handed? Can't tell → discard.
```

Guardrails are non-negotiable — any regression is an automatic discard. Direction is aspirational — you're looking for movement, not a target.

### User approval

Show the rubric to the user. Ask: "Does this capture what you mean by 'better'? Anything to add, remove, or reweight?"

**Do not proceed until the user says yes.** A wrong rubric means every iteration is wasted.

## Phase 2: The Loop

Before changing anything, **baseline**: snapshot the current state (git commit or copy), assess it using the rubric (score it or note strengths/weaknesses), and log it as iteration 0. This is your reference point.

```
REPEAT:
  1. Identify what feels weakest (or scores lowest)
  2. Make ONE focused change targeting that
  3. Judge the result — scored: grade all criteria; comparative: read old vs new
  4. KEEP (git commit) or DISCARD (revert)
  5. Log the iteration with reasoning
  6. Check stop conditions
```

### Rules

**One change per iteration.** Don't rewrite everything at once. A single focused change is easier to judge, easier to keep/discard, and builds a reviewable history.

**Judge holistically every time.** A change that improves one dimension but breaks another should be discarded.

**Simplicity tiebreaker.** If two versions feel equivalent, keep the simpler one. Removing something and getting equal quality is a great outcome — that's a simplification win.

**Don't game the rubric.** If you're optimizing for the letter of a criterion while violating its spirit, stop and flag it. Rubric drift is real.

**In comparative mode, bias toward "no improvement."** False positives compound. If you're not sure the new version is better, it probably isn't. Discard.

**Log everything.** Even discarded iterations are valuable — they show what didn't work and prevent re-trying the same thing.

### Log format

Log every iteration — keeps and discards. The format depends on your mode:

**Scored:** `| Iter | Score | Status | Change | Notes |`
**Comparative:** `| Iter | Verdict | Status | Change | Why |`

Verdicts in comparative mode: `better` / `same` / `worse`. Status: `baseline` / `keep` / `discard`.

## Phase 3: Convergence

### Stop conditions

- **Plateau** — 3 consecutive discards (nothing is improving)
- **Target reached** — scored mode hits the user's target; comparative mode: "I'd be happy handing this to someone"
- **Iteration limit** — default 10, user can change
- **User interrupts**
- **Can't find anything weak** — everything feels solid, nothing to target

### Final report

When the loop ends, summarize: total iterations (kept/discarded), net change, what worked, what didn't, and the full iteration log. The "what worked / didn't work" section is the most valuable part — it's institutional knowledge about what kind of changes help this artifact.

### Emitting tasks for things too big to handle in-loop

The loop handles small, iterative improvements. But when you hit something too big — a design decision, a fundamental architecture issue, a bug that needs human judgment — don't force it into an iteration. Emit it as a task in the project's `TASKS.md`:

```markdown
- [ ] Resolution bracket format conflicts with markdown link syntax in edge cases — needs spec decision #found #autorefine
- [ ] Parser doesn't handle Windows line endings — needs investigation, not a one-line fix #found #autorefine
```

Tag with `#found #autorefine` so it's traceable. Then keep looping on what you can improve.

## When to use autorefine

- **Good for:** Skills, docs, prompts, config files, small focused code — anything where "quality" matters but is hard to pin down
- **Good for:** When you know something could be better but can't articulate how — the interrogation forces clarity
- **Not for:** Large codebases (scope too broad), quick one-off fixes (`/simplify`), purely numeric optimization (just run the benchmark directly)
