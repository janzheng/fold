# Agentic Playtesting

## The idea

In game development, playtesting means putting a real player in front of the
game and watching what happens. Sometimes they get a script ("complete the
tutorial, try the crafting system, report what's confusing"). Sometimes they
get free play ("here's the game, go"). Either way, a human is operating the
system *as a user would* — not code testing code.

Agentic playtesting is the same thing, but the player is an LLM agent.

The agent reads a natural language task, operates the system through real
commands and interactions, navigates whatever state it encounters, makes
judgment calls, and reports what happened. It has to figure out *how* to
accomplish each step — just like a human playtester would. And just like a
human playtester, it sometimes struggles through a complex scenario, or
discovers a real bug mid-run that nobody thought to test for.

This is distinct from traditional automated testing:

| | Traditional tests | Agentic playtests |
|---|---|---|
| **Runner** | Test framework (jest, pytest, deno test) | LLM agent |
| **Execution** | Code calls code | Agent operates the system, reads output, makes decisions |
| **Determinism** | Same input = same output | Agent may take different paths each run |
| **Judgment** | `assertEquals(a, b)` | "Does this output look right?" |
| **Failure modes** | Pass/fail | Pass/fail + "this was confusing" + "this took too long" |
| **What they catch** | Regressions, logic errors | UX friction, missing errors, workflow gaps, real-world edge cases |

## Where playtests sit

```
Unit tests ──── Integration tests ──── Agentic playtests ──── Free exploration
deterministic                                                  open-ended
code-driven                                                    agent-driven
milliseconds                                                   minutes
assertions                                                     judgment
```

Traditional tests and agentic playtests are complementary:

- **Unit tests** verify internal logic (parser correctness, data structures).
- **Integration tests** verify component interactions (service A calls
  service B correctly).
- **Agentic playtests** verify the system works *as a user experiences it* —
  the last mile between correct code and usable product.

A bug might pass all unit tests but fail a playtest. The API might return
the right data, but the CLI renders it in a confusing way. The deployment
might succeed, but the onboarding flow breaks on step 3 because two forms
share a field name. Playtests catch that.

## Two modes of agentic playtesting

### Directed playtests

The agent gets a script with specific goals and pass criteria. In game dev,
this is like handing a playtester a checklist: "create an account, add an
item to cart, check out, report any friction." The steps are defined, but
the player still has to navigate the real system.

Directed playtests have explicit steps and expected outcomes, but the agent
decides how to execute. You'd spend significant time scripting these as
traditional tests (writing shell scripts to thread state across many
invocations, mocking dependencies, parsing output), or you could describe the
scenario in English and let the agent run it. The agent deals with timing,
unexpected output, and whatever state it finds.

**Example — CLI workflow:**
```markdown
- [ ] Create a new project using the CLI. Add three tasks to it.
  Mark one as complete. Run the list command and verify it shows
  2 pending and 1 complete.
```

**Example — API integration:**
```markdown
- [ ] Create a user via the API. Then create a second user with the
  same email. Verify the API returns a clear error, not a 500.
  Report the exact error message.
```

**Example — deployment verification:**
```markdown
- [ ] Deploy the app to staging. Open the landing page. Navigate to
  signup, create an account, and reach the dashboard. Report any
  errors, broken links, or missing assets.
```

### Exploratory playtests

The agent gets a goal but no script. In game dev, this is free play. The
value comes from *not* knowing what to look for.

**Example — fresh eyes:**
```markdown
- [ ] You're a developer who just cloned this repo. Follow the README
  to get it running, then try the main workflow end-to-end. Report
  anything confusing, broken, or undocumented.
```

**Example — adversarial:**
```markdown
- [ ] Try to break the permission system. Attempt to access resources
  you shouldn't be able to. Report any gaps.
```

**Example — ergonomics:**
```markdown
- [ ] Use the CLI for 10 minutes doing common tasks. Report which
  commands felt natural and which felt awkward or surprising.
```

## Why this works (and why it's hard to do traditionally)

### Multi-step workflows with state

Many real workflows involve 10+ sequential operations with state threading
between them: create a resource, configure it, trigger a process, verify the
output, clean up. As a traditional test, this becomes a fragile multi-hundred
line script full of assertions and mocks. As a playtest, it's a readable
paragraph.

**Example:** "Create a project, add collaborators, have one collaborator
push a change, verify the notification arrives, then remove the collaborator
and verify access is revoked." Describing this takes 2 sentences. Scripting
it traditionally takes a full test file with API mocking, user fixtures, and
notification stubs.

### Multi-session continuity

Some things only matter across sessions. "Does the app remember my
preferences after logging out and back in?" "If the server restarts
mid-operation, can I resume?" These are hard to script because they require
orchestrating process lifecycle. An agent just... does it. Log out, log in,
check if the state persisted.

### Self-improvement (dogfooding)

An agent can review the code of the system it's testing — finding architecture
drift, bugs, simplification opportunities. One pass produces a checklist of
findings. A second pass reads the checklist and fixes the issues. The system
improves itself through its own playtest infrastructure.

This is especially powerful when the playtest infrastructure *is* the product
(dev tools, CLIs, agent frameworks). If the playtest experience is painful,
that's itself a finding.

### Parallel divergence

Some decisions are best explored in parallel: "try approach A and approach B
from the same starting point, compare results." An agent can fork the state,
run two different strategies, and report which worked better. Scripting this
traditionally means managing parallel processes, shared state, and result
comparison — all from test code.

### Things you wouldn't think to test

The most valuable playtest findings are often surprises. An agent operating
the system naturally will hit edge cases that nobody anticipated: malformed
output that downstream tools can't parse, error messages that don't include
enough context to debug, budget limits that cut off work before it's saved.
These are "unknown unknowns" — real bugs found by real usage, not anticipated
edge cases.

## Anatomy of a playtest

A playtest is a markdown file with tasks described in natural language using
checkbox syntax. The agent operates the system, and results are tracked:

```markdown
# Deploy Verification

- [x] Deploy to staging and verify the health endpoint returns 200.
  Report the response body. — 11s

- [x] Create a test user through the signup flow. Verify the
  confirmation email is sent. Report any friction. — 31s

- [ ] Attempt to access the admin panel as the test user. Verify
  you get a 403, not a 500 or a redirect loop.
```

After completion, each task can be annotated with duration, cost (if
applicable), and notes. Unchecked boxes are failures or incomplete work.

### Pass criteria

Pass criteria are human-readable, not machine-parseable:

- "All tasks reach `[x]`"
- "Each finding is specific and actionable, not boilerplate"
- "Error messages include enough context to debug without reading source"
- "The agent reports no confusion navigating the workflow"

An agent (or human) judges whether the criteria are met. This is deliberate —
it allows criteria like "specific, not boilerplate" that you can't express
as `assertEquals`.

### Tiered risk

Organize playtests by risk level, always running safer ones first:

| Risk | Description | Examples |
|------|-------------|---------|
| None | Read-only, no side effects | Smoke tests, code analysis, output review |
| Low | Creates test data, easily reversible | User creation, file uploads, config changes |
| Medium | Modifies real state in isolated environment | Code changes in branches, schema migrations on staging |
| High | Affects production or shared state | Deployment, data migration, external API calls |

Lower-risk playtests validate basic plumbing before higher-risk ones attempt
real changes. If smoke tests fail, there's no point running deployment
verification.

## Results as history

Track playtest results with date, outcome, and notes. This creates
institutional knowledge that traditional test results don't carry:

```markdown
| Date | Playtest | Result | Notes |
|------|----------|--------|-------|
| 2026-03-13 | Smoke | Pass | 3/3 tasks, 28-38s each |
| 2026-03-14 | Deploy | Fail | Health check passed but signup flow broke — missing env var |
| 2026-03-14 | Deploy (re-run) | Pass | Fixed env var, signup flow works |
| 2026-03-15 | CLI ergonomics | Mixed | 4 commands natural, 2 awkward (list output, error format) |
```

When a playtest fails, the fix gets committed and the playtest is re-run.
The notes capture what broke and what was fixed. Over time, this becomes a
narrative of how the system evolved — not just "tests pass" but "here's what
we learned."

## Writing good playtests

### Task granularity

A playtest task should be a coherent unit of work that an agent can complete
in one session. Too granular and you're micromanaging — you've written a
script, not a playtest. Too broad and the agent thrashes without focus.

The sweet spot: describe a goal and enough context for the agent to know
when it's done.

```markdown
# Too granular (this is just a script)
- [ ] Run `curl localhost:3000/health`
- [ ] Check the response code is 200
- [ ] Check the body contains "ok"

# Too broad (agent will thrash)
- [ ] Test the entire API and fix any bugs

# Right level (goal-oriented, agent decides how)
- [ ] Hit the health endpoint and verify the response looks correct.
  Then try each CRUD operation on the /users resource. Report any
  unexpected status codes or error messages.
```

For directed playtests, include what "done" looks like but leave the *how*
open. For exploratory playtests, describe the scenario and what kind of
feedback you want.

### Multi-step vs single-task

Some scenarios naturally split into sequential tasks (plan → implement →
verify). Others are better as a single task with multiple verification
points (check path, write file, check permissions — all one coherent
"does isolation work?" check).

Split when tasks genuinely build on each other's output and you want
independent pass/fail tracking. Keep together when the steps are really one
logical operation.

### Multi-session playtests

When a playtest spans multiple sessions, use comments to guide the operator:

```markdown
- [ ] First session: create a project and add some data

<!-- After this completes:
  1. Note the project ID
  2. Restart the server
  3. Run session 2
-->

- [ ] Second session: verify the data survived the restart
```

When testing something like conversation memory or session persistence, you
can split into separate files so the answer can't leak between sessions.

## Failure analysis

Playtest failures look different from traditional test failures. There's no
stack trace — instead you have:

- **The task markdown.** Did the checkbox stay unchecked? Did it get checked
  but with suspicious output?
- **The agent transcript.** If your system captures agent output, this shows
  the agent's reasoning, the commands it tried, and where it got stuck. This
  is richer than a test's debug output.
- **Artifacts.** What files did the agent create or modify? Missing expected
  artifacts means something went wrong.
- **Duration and cost.** If a task that normally completes quickly suddenly
  takes much longer, the agent was struggling with something. Spikes in
  duration or cost are a signal even when the task technically passes.

The debugging workflow: check the checkbox status → read the transcript →
look at artifacts → check duration. Usually the transcript makes the failure
obvious — the agent will say things like "I tried X but got error Y" or
"the expected file wasn't at the expected path."

## Playtests improving playtests

Playtests can — and should — inform what needs to be tested next.

### Playtests that discover new playtest needs

When a playtest surfaces an unexpected issue, that's a signal that a new
playtest should cover that area. A deploy playtest discovers a missing env
var — that motivates a dedicated "environment configuration" playtest. An
API playtest finds inconsistent error formats — that motivates an "error
response consistency" playtest.

The pattern: run playtests → review findings → ask "what scenario would
have caught this earlier?" → write that playtest.

### Exploratory playtests that generate directed ones

An exploratory playtest ("use the CLI for 10 minutes, report what's awkward")
might surface 5 specific friction points. Each becomes a directed playtest
that can be re-run after fixes to verify improvement. The exploratory pass
seeds the directed suite.

### Self-referential playtesting

When the playtest infrastructure is part of the product (dev tools, agent
frameworks, CLIs), the playtest experience itself is subject to playtesting.
If authoring a playtest is confusing, if results tracking requires too much
manual work, if the agent gets stuck on infrastructure rather than the task —
those are findings.

The recursive loop:

```
Write playtest → Run playtest → Playtest surfaces issue
     ↑                              ↓
     └──── Write new playtest ←── Fix issue
```

## When to add new playtests

Playtests aren't generated automatically. A human (or agent acting as PM)
decides when a new playtest is warranted. Triggers:

- **New feature.** You built a new workflow → write a playtest that exercises
  it end-to-end.
- **Bug found in the wild.** A user hits something unexpected → write a
  playtest that would have caught it.
- **Playtest finding.** An existing playtest surfaces something unexpected →
  ask whether a dedicated playtest should cover that area going forward.
- **Complexity increase.** A workflow that used to be simple now has more
  moving parts → a playtest validates the full flow still makes sense.
- **Gut feeling.** "I'm not confident this works right" is a valid reason.
  Cheap to author, expensive bugs to miss.

## Limitations and tradeoffs

### Not for CI gates

Playtests are non-deterministic. The same playtest can take different paths
across runs. An agent might interpret a task differently on Tuesday vs
Wednesday. This makes them unsuitable as CI gates — you wouldn't block a
release on a playtest the way you'd block on a unit test suite.

Playtests inform design and architecture decisions. They're closer to a QA
review than a green/red CI check. In game dev, you don't gate your release
on whether a playtester had fun — you use their feedback to improve the next
build.

### Slow

A full playtest suite takes minutes to hours, not seconds. This is fine —
playtests aren't run on every commit. They're run after significant changes,
periodically, or when you want confidence in a new feature.

### Non-deterministic

An agent might take a different path each run. It might find a bug on
Tuesday that it misses on Wednesday. This is actually a feature — repeated
runs can surface different issues. But it means you can't treat a single
passing run as proof of correctness the way you can with a deterministic
test.

### Agent judgment is imperfect

An agent might mark a task as passed when a human would flag issues. Or it
might get stuck on something trivial that a human would breeze through.
Pass criteria like "specific, not boilerplate" rely on the agent's judgment,
which varies. For high-stakes verification, a human should review the
transcripts and artifacts, not just the checkboxes.

### Cost

Some systems under test have measurable per-run costs (LLM API calls,
compute time). Others don't (testing a local CLI, a web UI). When costs are
trackable, recording them per-task helps spot regressions — a task that
suddenly costs 10x more is a signal. But cost tracking is optional metadata,
not a core requirement of the playtest format.

## What playtests are not

Playtests are not a replacement for unit tests or integration tests. They're
a different tool for a different job:

- **Don't use playtests for:** deterministic logic verification, fast CI
  feedback, pure function correctness. Write a test for that.
- **Do use playtests for:** end-to-end workflows, UX ergonomics, multi-step
  stateful scenarios, self-improvement loops, things that are expensive to
  script but cheap to describe.

The rule of thumb: if you can write `assertEquals(f(x), y)`, write a unit
test. If you need a human (or agent) to *operate the system and judge the
result*, write a playtest.

## Design principles

1. **Natural language tasks.** Each playtest is plain English in a markdown
   file. No test framework, no assertions library, no fixtures.

2. **Agent-operated.** The agent runs real commands against the real system.
   If something is broken, the agent hits the same error a user would.

3. **Tiered risk.** Safer playtests run first. Higher-risk ones use isolation
   (branches, staging, sandboxes). Escalate gradually.

4. **Observable results.** Duration, outcome, and optional cost are tracked
   per task. Regressions are visible in the results history.

5. **Chained workflows.** Playtests can feed into each other — an analysis
   pass produces findings, a fix pass works through them. Tasks within a
   playtest can be sequential with state dependencies.

6. **Dogfooding.** When applicable, use the system to playtest itself. The
   experience of using the playtest infrastructure is itself feedback.

7. **Both modes matter.** Directed playtests catch regressions. Exploratory
   playtests find new problems. A healthy suite has both.

8. **Playtests beget playtests.** Findings from one playtest can motivate new
   ones. Exploratory playtests seed the directed suite. The playtest
   infrastructure itself is subject to playtesting.

---

## Appendix: MVA case study

MVA (an agent orchestration framework) developed this approach through its
own self-testing. The playtest suite grew organically as features were built,
and several patterns emerged that informed this spec.

### Tier structure

MVA uses numbered tiers (0–8) organized by risk:

| Tier | What it tests | Key insight |
|------|---------------|-------------|
| 0 — Smoke | Can agents read tasks and respond? | Validates the full pipeline in 30 seconds |
| 1 — Observe | Are transcripts and metadata captured? | Agent verifies its own observability |
| 2 — Analyze | Read-only code review of MVA itself | Produces checklists of findings (20-30 items each) |
| 3 — Improve | Fix issues from tier 2 checklists | Analyze → fix pipeline via shared markdown checklists |
| 4 — Multi-agent | Sequential agents building on each other's work | Tests coordination without conflicts |
| 5 — Lifecycle | Fork, checkpoint, rewind workflows | 6 tasks, 15+ CLI invocations, 45 iterations for rewind |
| 6 — Resume | Session persistence across invocations | Agent writes marker file in session 1, finds it in session 2 |
| 6b — Memory | Conversation context survives resume | Secret passphrase test — agent recalls without disk access |
| 7 — Isolation | Agents verify they're in the right environment | Path checks, git branch checks, contamination checks |
| 8 — Fork+parallel | Divergent approaches from same starting point | Two agents, two strategies, no cross-contamination |

### Bugs found by playtesting (not unit tests)

- **JSON output parsing.** Claude outputs JSON arrays in a format the parser
  didn't handle. Only surfaced when a real agent tried to resume a session.
- **Path doubling.** The prompt rewriter wasn't idempotent — rewriting an
  already-rewritten path doubled the prefix. Only surfaced when a forked
  workspace ran against a rewritten prompt.
- **Budget cutoff.** An agent hit a $1 cost cap before saving its output
  file. The analysis was complete but the file never got written. Only
  surfaced because a real agent did real work that took longer than expected.
- **Process leaks.** 853 orphaned processes accumulated after 3 sequential
  tasks. Required periodic PID collection while the parent was still alive,
  because the process tree dissolves after parent exit.

None of these would have been caught by unit tests. They emerged from real
agents operating the real system under real conditions.

### The analyze → fix pipeline

Tier 2 agents review MVA's code and write findings as `- [ ]` checkbox
items to shared checklist files. Tier 3 agents read those checklists, fix
each item, mark it `- [x]`, run tests, and commit. The human can review
the checklist between passes, approving or rejecting findings before the
fix pass runs.

This pattern generalizes: any system can have an "analyze" playtest that
produces findings and a "fix" playtest that works through them.
