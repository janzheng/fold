---
name: fold:autorefine
description: "Improve code, docs, skills, prompts, or other artifacts through an autonomous autorefine loop using scored rubrics or comparative checks."
---

# autorefine — Autonomous Refinement Loop


## Lookup Cues

Former frontmatter detail, kept here so global lookup stays compact:

> Autonomous refinement loop — the "improve" facet of fold. Agent — agent and user agree on what "better" means, then the agent iterates (modify → compare → keep/discard → repeat) until quality converges. Learns across sessions via REFINE.md. Use when the user says "autorefine", "refine this", "make this better", "iterate on this", "keep improving", "optimize this", or wants an autonomous improvement loop on code, docs, skills, or any artifact.

Make something better through iteration. You and the user agree on what "better" means, then you loop: make one change, judge whether it helped, keep or discard, repeat.

Learns across sessions via `REFINE.md` — a project-local file that accumulates what works, what doesn't, and how to approach refinement in this project. Each session starts smarter than the last.

The hard part isn't the loop — it's agreeing on what "better" means. Sometimes it's measurable (test pass rate, line count). Sometimes it's subjective (does this feel clearer? would an agent follow this?). Both are valid. You figure out which one together before touching anything.

## Phase 0: Read REFINE.md

Before the interview, check if `REFINE.md` exists in the project root.

**If it exists:** Read it. Pay attention to:
- **Strategy** — how refinement works in this project
- **Heuristics** — learned rules from past sessions. Don't try things listed in "What didn't work."
- **Session log** — if this target was refined before, note what happened

This context shapes the interview — you can skip questions REFINE.md already answers and surface relevant past learnings.

**If it doesn't exist:** That's fine. You'll create it after the session.

## Phase 1: Agree on What "Better" Means

**This is mandatory. Do not skip this. Do not assume what "better" means.**

### The interrogation (progressive shortening)

The interview adapts based on REFINE.md maturity:

**First session (no REFINE.md):** Full interview.
1. **What are you refining?** (a file, a skill, a CLI, an API, a doc)
2. **What does "better" feel like to you?** Not a formula — a vibe. "Clearer." "Less confusing." "An agent would actually follow this." Push for specifics but accept that some answers are subjective.
3. **What DOESN'T matter?** (performance is fine, don't touch the API surface, style is irrelevant)
4. **How would you know if it got worse?** This is often easier to answer than "what's better." "If it got longer without getting clearer." "If it lost a concept." "If an agent would get confused."
5. **Can we measure it, or do we taste it?** This determines the grading mode.

**Subsequent sessions (REFINE.md exists):** Short interview. Surface what REFINE.md says and check: "Last time you said brevity matters most and reorganizing never helps. Still true? Anything changed?" User corrects or confirms. Update REFINE.md inline with corrections.

**Mature sessions (REFINE.md has solid Strategy + Heuristics):** Minimal check-in. "Anything changed since last time?" If no, skip straight to the loop.

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

Before each iteration, check REFINE.md heuristics — don't try things in "What didn't work."

The loop has two modes. Choose during the Phase 1 interview:

### Quick mode (single agent — the default)

Use for small artifacts (< 50 lines), quick iterations, or when the user explicitly wants single-agent mode.

```
REPEAT:
  1. Identify what feels weakest (or scores lowest)
  2. Make ONE focused change targeting that
  3. Judge the result — scored: grade all criteria; comparative: read old vs new
  4. KEEP (git commit) or DISCARD (revert)
  5. Log the iteration with reasoning
  6. Note if this confirms or contradicts a REFINE.md heuristic
  7. Check stop conditions
```

### Deep mode (parallel research + fresh-eyes judging)

Use when the artifact is complex (> 200 lines, multiple files), quality matters more than speed, or past sessions show the simple loop plateaus quickly.

```
REPEAT:
  2a. RESEARCH (parallel, read-only)
      Spawn 2-3 agents in parallel. Each explores from a different angle:
        Agent A: "What's weakest by rubric? Do NOT modify files."
        Agent B: "What would a fresh reader trip on? Do NOT modify files."
        Agent C: "What contradicts REFINE.md learnings? Do NOT modify files."
      All agents report findings only.

  2b. SYNTHESIZE (you, the orchestrator)
      Read ALL research findings.
      Identify THE ONE change to make this iteration.
      Write a specific spec — not "make it better" but:
        "In src/auth.ts:42, change X to Y because [reason from research]"
      Include file paths, line numbers, and exact changes.
      Decide: continue a researcher (if it already loaded the target files)
              or spawn fresh (if the fix is in a different area)?

  2c. CHANGE (one agent, one change)
      Execute the synthesized spec.
      Self-verify: does it compile? tests pass?

  2d. JUDGE (FRESH agent — anti-injection)
      Spawn a NEW agent with no implementation context.
      The judge sees ONLY:
        - The rubric
        - The diff (old text vs new text)
        - The iteration log (what was tried before)
      The judge does NOT see:
        - The changer's explanation of why it's better
        - The research findings that motivated the change
        - The synthesis spec
      The judge forms its own opinion from the artifact, not arguments.
      Verdict: KEEP (git commit) or DISCARD (revert).

  2e. Log the iteration + check stop conditions + repeat
```

**Why deep mode works:** Parallel research catches things a single pass misses. Synthesis means the change is targeted and specific. Fresh-eyes judging prevents self-bias — the changer can't persuade the judge because the judge only sees the diff.

**When to use which:** Ask in the Phase 1 interview: "Should we use quick mode (single agent, fast) or deep mode (parallel research + fresh-eyes judging, thorough)?"

### Rules

**One change per iteration.** Don't rewrite everything at once. A single focused change is easier to judge, easier to keep/discard, and builds a reviewable history.

**Judge holistically every time.** A change that improves one dimension but breaks another should be discarded.

**Simplicity tiebreaker.** If two versions feel equivalent, keep the simpler one. Removing something and getting equal quality is a great outcome — that's a simplification win.

**Don't game the rubric.** If you're optimizing for the letter of a criterion while violating its spirit, stop and flag it. Rubric drift is real.

**In comparative mode, bias toward "no improvement."** False positives compound. If you're not sure the new version is better, it probably isn't. Discard.

**Log everything.** Even discarded iterations are valuable — they show what didn't work and prevent re-trying the same thing.

**Respect REFINE.md.** If a past session learned "reorganizing without cutting never helps," don't try it again. If you discover something contradicts a heuristic, note it — you'll update REFINE.md at the end.

**Evaluators judge artifacts, not arguments.** In deep mode, the judge never sees the changer's reasoning. This prevents persuasion bias — LLMs are convincing writers, and a judge that reads "I improved clarity by..." will be anchored by the argument instead of evaluating the diff independently.

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

### Update REFINE.md

After the final report, update `REFINE.md` (create it if it doesn't exist):

1. **Session log** — append a brief entry (target, mode, iterations, net result, new heuristics). Keep the last 3 session logs; if adding a 4th, summarize the oldest into a one-liner and drop the detail.
2. **Heuristics** — promote any new patterns discovered during the loop to "What worked" or "What didn't work." If a heuristic was contradicted, update or remove it with a note.
3. **Strategy** — if the Strategy section is empty or stale, rewrite it based on accumulated evidence. This is the agent's current best understanding of how to refine things in this project.

If the user corrected you during the session (redirected strategy, overrode a keep/discard, added a constraint), write those corrections into REFINE.md immediately — they're the highest-signal heuristics. Tag them with the date and note they came from human override.

### Emitting tasks for things too big to handle in-loop

The loop handles small, iterative improvements. But when you hit something too big — a design decision, a fundamental architecture issue, a bug that needs human judgment — don't force it into an iteration. Emit it as a task in the project's `TASKS.md`:

```markdown
- [ ] Resolution bracket format conflicts with markdown link syntax in edge cases — needs spec decision #found #autorefine
- [ ] Parser doesn't handle Windows line endings — needs investigation, not a one-line fix #found #autorefine
```

Tag with `#found #autorefine` so it's traceable. Then keep looping on what you can improve.

## REFINE.md format

When creating REFINE.md for the first time, use this structure:

```markdown
# REFINE.md

## Strategy

<!-- How to approach refinement in this project. Rewritten as patterns emerge. -->

## Heuristics

<!-- Learned rules from past sessions. Newest at top. -->

## What worked

<!-- Patterns that reliably improved things. -->

## What didn't work

<!-- Patterns the agent should stop trying. -->

## Session log

<!-- Brief summary of each autorefine session. Keep last 3 detailed; summarize older ones. -->
```

REFINE.md is **not** MEMORY.md — it's owned by the refinement process, not the agent's memory system. It works with any agent or orchestrator. Keep it under 200 lines.

## Continue vs Spawn

When deep mode needs to hand off from research to change, or from change to judge:

| Situation | Do | Why |
|-----------|-----|-----|
| Researcher explored the exact files to change | Continue (SendMessage) | Context reuse saves tokens |
| Research was broad, fix is narrow | Spawn fresh (Agent) | Avoid context noise |
| Fixing a failure from previous attempt | Continue | Error context helps |
| Judging another agent's work | **Always spawn fresh** | Fresh eyes, no anchoring |
| Wrong approach, starting over | Spawn fresh | Avoid anchoring |

The judge is always a fresh agent — no exceptions.

## When to use autorefine

- **Good for:** Skills, docs, prompts, config files, small focused code — anything where "quality" matters but is hard to pin down
- **Good for:** When you know something could be better but can't articulate how — the interrogation forces clarity
- **Not for:** Large codebases (scope too broad), quick one-off fixes (`/simplify`), purely numeric optimization (just run the benchmark directly)

## Filing structural gripes as gotchas

REFINE.md's "What didn't work" section is a private session log. If a discard reveals a *structural trap* (not just a bad attempt) — the kind of thing that cost you >5 minutes to diagnose and will bite again — promote it to the project's `GOTCHAS.md` as a durable entry. See `fold:audit/gotchas.md` for the format. The discard stays in REFINE.md; the rule lives in GOTCHAS.
