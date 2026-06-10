---
name: fold:debug
description: "Find the root cause of a specific known bug, then optionally fix it — reproduce, trace the causal chain to where valid state first went wrong, confirm the whole chain before touching code, fix test-first and minimal. The targeted root-cause facet of fold (vs fold:audit's broad sweep for unknown bugs). Use when the user says 'debug this', 'why is this failing', 'fix this bug', 'trace this error', 'find the root cause', 'what's causing X', 'this is broken', 'it worked before', 'keeps failing', 'I'm stuck on', or pastes a stack trace, error message, or failing test."
---

# fold:debug — Root-Cause a Known Bug

## Lookup Cues

Former frontmatter detail, kept here so global lookup stays compact:

> Systematically find the root cause of one specific bug and optionally fix it — reproduce, trace the causal chain backward to where valid state first became invalid, confirm the whole chain before fixing, then fix test-first and minimal. The **targeted** discover facet of fold — one known-broken thing traced to ground — as opposed to fold:audit's broad sweep for unknown bugs. Use when the user says "debug this", "why is this failing", "fix this bug", "trace this error", "find the root cause", "what's causing X", "this is broken", "it worked before", "keeps failing", "I'm stuck on", or pastes a stack trace, error message, or failing test.

**This skill finds WHY one specific thing is broken.** It's the opposite shape from `fold:audit` (which sweeps for *unknown* bugs across a whole codebase). Here you start with one symptom and trace it to its origin.

> **Where this sits in fold's discover facet:**
> - `fold:audit` = broad parallel sweep, finds *unknown* bugs, read-only
> - `fold:playtest` = exercise the product, surface what's weird or broken
> - **`fold:debug`** = one *known* symptom, traced to root cause, then fixed
> - `fold:tasks` = track a deferred fix as a task; `GOTCHAS.md` = record the trap so it doesn't bite twice

## The four rules

Everything below serves these. If you're violating one, stop.

1. **Investigate before fixing.** No proposed fix until you can state the full causal chain from trigger to symptom with **no gaps**. "Somehow X causes Y" is a gap, not a chain.
2. **Predict the uncertain links.** When a link is non-obvious, name something *else* — a different code path or input — that must also be true if the link is real. If your fix "works" but the prediction was wrong, you patched a symptom and the real cause is still live.
3. **One change at a time.** Test one hypothesis, change one thing. Changing several things "to see what helps" is shotgun debugging — it hides which change mattered and breeds new bugs.
4. **When stuck, diagnose why you're stuck — don't try harder.** Three dead hypotheses means your mental model or an assumption is wrong. Stepping back beats a fourth guess.

## The flow

### 1. Frame the symptom

Get to a clear problem statement. A pasted stack trace, error, or failing test *is* the statement — start there. For a one-line description ("login is broken"), pin down: observed behavior, expected behavior, how to trigger it.

Don't ask questions yet — investigate first (read code, run the test, trigger the error). Ask only when a genuine ambiguity blocks investigation and reading code won't resolve it. **One exception:** if the user says they've already been trying ("keeps failing", "I'm stuck"), ask what they've tried first, so you don't repeat dead ends.

**Trivial fast-path:** if the cause is readable straight from the input (typo, missing import, obvious null deref, off-by-one) and verifying doesn't need deep tracing, name the cause + one-line fix, confirm they want it applied, fix, skip to capture. When in doubt, run the full flow — a wrong root cause costs more than a few minutes of tracing.

### 2. Reproduce

Confirm the bug exists and watch it behave. Run the test, trigger the error, follow the repro steps.

- **Browser bugs** — drive it with your browser tooling (`chrome-cdp` / `dev-browser`).
- **Needs special conditions** (data state, env, external service) you can't set up alone — write down the exact setup and walk the user through it.
- **Won't reproduce after 2-3 tries** — it's likely intermittent: a race, uninitialized state, time/ordering dependence, or test pollution from a prior test. Instrument the boundaries and run repeatedly rather than guessing.
- **Can't reproduce at all here** — document what you tried and which condition seems missing. Don't fix blind.

### 3. Trace to where state went wrong

Work **backward** from the symptom to where valid state first became invalid. Read code-shape to form a hypothesis, then confirm with *observed* values — assumed values lie, observed values don't.

Recipe:
1. Read the stack trace bottom-to-top, opening each frame. The bottom is the symptom; the cause is upstream.
2. Find the first frame where the data is *already* wrong — that bounds where to look.
3. Instrument the boundaries around it (logs, breakpoints, assertions capturing actual values at entry/exit).
4. Walk until valid-in becomes invalid-out. That transition is the root-cause site.

Don't stop at the first function that *looks* wrong — the cause is where bad state originates, not where it's first noticed. As you go: check `git log --oneline -10 -- <file>` for recent changes; if it's a regression ("worked before"), `git bisect` is faster than reading.

### 4. Confirm the root cause

**Assumption audit first.** List every "this must be true" your understanding rests on — this function returns what its name implies, config loads before this runs, the caller passes non-null, the DB is in the state the test implies. Mark each *verified* (you read it / ran it / checked state) or *assumed*. **Assumptions are the #1 source of stuck debugging — many "wrong hypotheses" are right hypotheses tested against a wrong assumption.**

Then form hypotheses, ranked. Each needs:
- What's wrong and where (`file:line`)
- **A grounding observation** — a real value, a log line, a behavior delta vs a working case. "X seems off" is not evidence; "X is null at `auth.ts:42` because Y is never initialized on the path that runs under condition Z" is.
- The causal chain, step by step
- For uncertain links: a prediction (rule 2)

**Causal-chain gate:** do not move to a fix until the chain explains every step from trigger to symptom with no gaps. (The user can explicitly authorize proceeding on the best-available hypothesis if you're genuinely stuck.)

Then present: the root cause (chain + `file:line`), the proposed fix, which test should catch it, and whether an existing test *should* have caught it and why it didn't. **Ask whether to fix now or stop at diagnosis** — don't assume they want code changed.

### 5. Fix — only if asked

*One change at a time. If you're changing several things, stop.*

Test-first:
1. Write a failing test that captures the bug (or use the existing one).
2. Confirm it fails for the *right* reason — the root cause, not unrelated setup.
3. Implement the **minimal** fix — the root cause and nothing else. No drive-by refactors or formatting in a bug fix.
4. Confirm the test passes; run the broader suite for regressions.
5. Read every changed line before declaring done.

**If the fix fails:** go back to step 4 and *explicitly invalidate the current hypothesis* — say what evidence killed it — before forming a new one. Do **not** retry variants of the same theory ("maybe it's the other branch too"); that's the rationalization spiral. Three failed fixes = your root cause was probably wrong; re-trace.

### 6. Capture — so it doesn't bite twice

A confirmed root cause is durable knowledge. Route it:

- **`GOTCHAS.md`** — default for any trap that cost >5 min. Same `Symptom / Why / Fix / Reference` shape `fold:audit` uses. This is the temporal-boundary payoff: future-you hits the symptom and reads the answer instead of re-debugging.
- **`/fold:note`** — when the finding is an atemporal truth worth grepping (`X.foo()` returns `T | undefined` when Y, not just `T`).
- **`/fold:journal`** — when the investigation was cross-cutting, or the *diagnostic path* itself was non-obvious and worth narrating.
- **`TASKS.md`** — if you stopped at diagnosis, file the fix as a task with `#bug` (see `/fold:tasks`).
- When a gotcha bites a **second** place, graduate it to `pitfalls.md`.

Skip capture for mechanical one-offs with no generalizable lesson — don't clutter `GOTCHAS.md` with "fixed a typo."

## Fresh eyes: dispatch subagents when stuck

Same principle as `fold:audit` — the agent holding the whole session is biased by everything it's already concluded. When hypotheses are bottlenecked across **independent** subsystems, dispatch read-only subagents in parallel, each with one explicit hypothesis and a structured evidence-return format. No code edits by subagents. Skip when hypotheses depend on each other's outcomes. No subagent primitive in the harness? Run the probes sequentially in ranked order — it's a latency optimization, not a correctness requirement.

## Smart escalation — when 2-3 hypotheses die

Don't guess a fourth. Diagnose the *pattern*:

| Pattern | What it means | Next move |
|---|---|---|
| Hypotheses point at different subsystems | A design problem, not a localized bug | Surface it → `/fold:explore` |
| Evidence contradicts itself | Your mental model of the code is wrong | Re-read the path with no assumptions |
| Works locally, fails in CI/prod | Environment, not logic | Focus on env, config, deps, timing, build artifacts |
| Fix works but the prediction was wrong | Symptom patch — real cause still live | Keep tracing |

## When the bug is really a design problem

Sometimes tracing reveals the bug can't be cleanly fixed inside the current design — the responsibility lives in the wrong place, the spec itself is wrong, or every fix is a workaround. That's not a debug anymore; surface it and route to `/fold:explore` (or write a `/fold:brief` if the redesign needs investigation first). Size alone doesn't qualify — a big bug with a clear fix is still a fix.

## What NOT to do

- **Don't fix before you can explain the whole chain.** A fix without a confirmed cause is a guess wearing a lab coat.
- **Don't shotgun.** Multiple simultaneous changes hide which one mattered.
- **Don't theorize from code alone.** Instrument and observe real values — assumed values are where bugs hide.
- **Don't retry variants of a dead hypothesis.** Invalidate it out loud, then form a genuinely new one.
- **Don't bundle cleanup into a bug fix.** Minimal fix, root cause only; refactors are a separate commit.
- **Don't auto-commit or open PRs.** Fold debugging ends at "fixed + captured" — committing and pushing is the user's call, not a handoff pipeline.

## See also

- `/fold:audit` — the broad-sweep sibling: parallel waves finding *unknown* bugs (this skill traces *one known* one). Its `gotchas.md` holds the `GOTCHAS.md` format reference.
- `/fold:playtest` — exercise the product to surface what's broken in the first place
- `/fold:tasks` — track a deferred fix as a `#bug` task
- `/fold:note` · `/fold:journal` — where confirmed findings land
- `/fold:explore` — when the bug turns out to be a design problem
