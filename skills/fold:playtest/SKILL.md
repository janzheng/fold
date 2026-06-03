---
name: fold:playtest
description: "Agentic playtesting — the discover facet of fold. Three modes: run (execute directed playtests), explore (open-ended fresh-eyes/adversarial/ergonomics/dogfooding), improve (analyze→fix pipeline). Use when the user says playtest, run playtest, try to break it, what's weird about this, fresh eyes, dogfood, analyze and fix."
---

# fold:playtest — Agentic Playtesting


## Lookup Cues

The **discover** facet of fold. Put an LLM agent in front of your system as a creative, distracted, clever user — finds loopholes, design bugs, surprising usage patterns, and "huh" moments that scripted tests can't catch.

Use when the user says "playtest this", "run playtest", "execute playtest", "try to break it", "what's weird about this", "fresh eyes", "explore this", "use it and tell me what's awkward", "dogfood this", "analyze and fix", "self-improve", "review and fix", "find issues and fix them", or points at a `playtests/*.md` file.

## Pairs with

- `/fold:tasks` — discoveries get emitted as mxit tasks with `#found`
- `/fold:autorefine` — too-big issues get emitted as mxit tasks with `#found`, then refined
- `/fold` — the full loop: discover → track → improve → fold again

## Three modes

| Mode | Use when | Default risk tier |
|------|----------|-------------------|
| **Run** | Playtest file exists with directed `- [ ]` tasks; execute them and mark outcomes | Whatever the file declares |
| **Explore** | No script — open-ended investigation: fresh eyes, adversarial probing, ergonomics, dogfooding | `none` / `low` |
| **Improve** | Analyze→fix pipeline: pass 1 produces findings as a checklist, human reviews, pass 2 fixes them | Read-only for analyze, varies for fix |

**Pick one based on the user's intent. If unclear, ask.** Run is the default when a playtest file is named; Explore is the default for "go look at X with fresh eyes"; Improve fires on "find issues and fix them".

## When to playtest (not unit test)

- `assertEquals(f(x), y)` → write a test
- "What breaks if someone does something dumb?" → playtest
- "What happens at the edges?" → playtest
- "Is this design actually fun / usable / robust?" → playtest
- "What would a clever adversary try?" → playtest

If a script can already test it, don't write a playtest. Playtests are for things scripts CAN'T catch: judgment calls, creative misuse, workflow friction, design flaws, unknown unknowns.

## Format (shared by all modes)

Playtest files are markdown checklists at `playtests/<name>.md`. Each task is a natural-language goal using checkbox syntax.

### Checkbox statuses

```
- [ ] open       — not yet attempted
- [x] done       — executed (check resolution for pass/fail)
- [@] in progress — agent is currently working on this
- [~] skipped    — not relevant or superseded
- [!] important  — prioritize this task
```

### Structure

- Tasks start with `- [ ]` (hyphen, space, checkbox)
- Sub-tasks indent 2 spaces per level
- Group tasks under markdown headings (`##`, `###`)
- Tags: `#tag` or `#tag=value` — e.g. `#bug`, `#risk=high`
- Blank line between groups

### Resolution keywords

Mark `[x]` and add a resolution bracket describing what happened:

| Keyword | Meaning |
|---------|---------|
| `pass` | System handled it well — no issues |
| `fail` | System misbehaved — crash, wrong output, silent corruption |
| `found` | Discovered something — bug, loophole, clever usage, design flaw |
| `confused` | Got stuck on UX/DX — works but hard to use or understand |
| `blocked` | Couldn't attempt — dependency missing, system down |

Format: `[keyword: what happened]`. `fail`/`confused`/`found` still get `[x]` (executed); only `blocked` stays `[ ]`.

### Risk tiers

Organize by risk; always run safer tiers first. If a smoke test fails, don't escalate.

| Risk | Description | Examples |
|------|-------------|----------|
| `none` | Read-only, no side effects | Smoke tests, code analysis, output review |
| `low` | Creates test data, easily reversible | User creation, file uploads, config changes |
| `medium` | Modifies real state in isolated env | Code changes in branches, staging migrations |
| `high` | Affects production or shared state | Deployment, data migration, external API calls |

Use headings to group: `## Smoke (risk: none)`, `## Deploy (risk: high)`.

### Duration (optional)

Append `— 11s`, `— 2m30s`, or `— 31s, $0.12`. Spikes are signals — if a normally-10s task suddenly takes 2m, you were struggling. Don't fabricate timing to fill the format.

### Task granularity

Describe a scenario and what kind of discoveries you're looking for. Not a script, not a vague directive.

```markdown
# Too granular (this is a script — write a test instead)
- [ ] Run `curl localhost:3000/health`
- [ ] Check the response code is 200

# Too broad (agent will thrash)
- [ ] Test everything and report bugs

# Right level — directed discovery
- [ ] Try to create resources with edge-case inputs: empty strings, unicode,
  very long names, special characters. Report which ones the system handles
  gracefully and which ones it chokes on.

# Right level — open exploration
- [ ] Use the CLI for 10 minutes doing real tasks. Report anything that
  surprised you — good or bad.
```

### Results history

Track runs in `playtests/PLAYTEST-RESULTS.md`:

```markdown
| Date | Playtest | Result | Notes |
|------|----------|--------|-------|
| 2026-03-13 | CLI boundaries | 4 found | Silent failures on pipe chaining, search-as-grep trick |
| 2026-03-14 | Race conditions | 2 found | Duplicate creation on simultaneous calls |
```

### File layout

```
project/
├── playtests/
│   ├── boundaries.md          # Edge cases, weird inputs, race conditions
│   ├── fresh-eyes.md          # New user perspective, onboarding friction
│   ├── adversarial.md         # Try to break permissions, abuse mechanics
│   ├── analysis-2026-MM-DD.md # Findings from an Improve run
│   └── PLAYTEST-RESULTS.md    # History of all runs
└── ...
```

---

## Workflow: Run

You are a playtester. Read the playtest file, execute each task by operating the real system, judge the result, and mark outcomes.

### 1. Read the playtest file

Understand each task's goal and what "done" looks like.

### 2. Check the risk tier

Start with `none`/`low`. If those fail, stop — don't escalate to higher tiers. If a tier-0 smoke fails, don't run tier-1 tasks that depend on the same system.

### 3. Execute each task

For each `- [ ]`:
1. Read the task description carefully
2. Figure out *how* to accomplish it (the task says what, you decide how)
3. Run real commands against the real system. You are *using* the system, not writing test code.
4. Observe the output. Does it match expectations?
5. Update the task with the result

```markdown
# Before
- [ ] Create a user and verify the welcome email is sent

# After — pass
- [x] [pass: user created, email arrived in 4s] Create a user and verify the welcome email is sent — 31s

# After — fail
- [x] [fail: user created but no email sent, no error logged] Create a user … — 28s

# After — confused
- [x] [confused: couldn't find the signup page, had to grep the codebase] Create a user … — 3m12s

# After — blocked
- [ ] [blocked: staging server is down] Create a user …
```

### 4. Judgment calls

You are not asserting `a === b`. You are judging:

- **Does this output look right?** — would a user understand this?
- **Is this error message helpful?** — could someone debug from this?
- **Was this confusing?** — did I have to think too hard?
- **Is anything missing?** — should something be here that isn't?

Report honestly. "This worked but the error message is useless" is a valid finding even when the task passes.

### 5. Multi-step tasks

Execute as one coherent operation, don't split into micro-steps:

```markdown
- [ ] Create a project, add 3 tasks, mark one complete. Verify the list shows
  2 pending and 1 done. Then delete the project and verify it's gone.
```

### 6. When to stop early

- **Cascading failure:** if 3+ consecutive tasks fail for the same root cause, note the pattern and skip remaining tasks in that group
- **System down:** mark remaining `[blocked]` and report
- **Tier escalation gate:** smoke fails → don't run higher tiers

### 7. After the run

1. Update the playtest file with all results
2. Add a row to `PLAYTEST-RESULTS.md`
3. If any task got `fail` or `found`, suggest whether a new directed playtest should cover that area

---

## Workflow: Explore

You have no script. Use the system, find problems, report what you discover. The value comes from *not* knowing what to look for.

### Sub-modes

| Sub-mode | Best for | Example tasks |
|----------|----------|---------------|
| **Fresh eyes** | Onboarding, docs gaps, first-run | "Follow the README to get this running. Report anything missing/confusing/broken." |
| **Adversarial** | Security, error handling, resilience | "Try to access resources you shouldn't. Feed unexpected input. Try to corrupt state." |
| **Ergonomics** | DX/UX, command naming, output formatting | "Use the CLI for 10 minutes. Report which commands felt natural and which felt awkward." |
| **Dogfooding** | Dev tools, CLIs, agent frameworks | "Use this tool for a real task in your workflow. Report where it helped and where it got in the way." |

### How to explore

1. **Start with the obvious path.** What would a new user try first? Do that.
2. **Then deviate.** What if you skip a step? Use the wrong flag? Give unexpected input?
3. **Follow your confusion.** If something surprises you, dig in. That's where findings live.
4. **Try the second time.** First-time friction matters; so does "does this get easier with practice?"
5. **Think about downstream.** If this output feeds another tool, does it parse cleanly?

### Reporting findings

Write each as a `[x] [found: ...]` task:

```markdown
# Exploratory: Fresh Eyes on CLI

- [x] [found: error on `create` with no args says "invalid input" but doesn't show
  usage or available flags] Tried the create command without arguments — 45s

- [x] [found: `list` outputs tabs but `export` expects CSV, so piping fails silently]
  Tried common command combinations — 2m10s

- [x] [pass: help text is clear, examples are useful] Checked the help system — 30s

- [x] [confused: filter-by-date flag exists but isn't in --help, only the README]
  Tried to filter output — 1m45s
```

### What makes a good finding

**Good:** "The `create` command with no args returns 'invalid input' but doesn't show usage. Expected: usage hint with available flags."

**Bad:** "Some commands could have better error messages."

Be specific. Name the command, the input, the actual output, what you expected. If a finding isn't actionable, it's not a finding.

### Explore → Run pipeline

After an exploratory run, each specific finding can become a directed `Run` playtest:

```markdown
# Generated from exploratory run 2026-03-15

## Error Messages (risk: none)
- [ ] Run `create` with no arguments. Verify the error includes usage and available flags.

## Command Piping (risk: none)
- [ ] Pipe `list` output to `export`. Verify formats are compatible or that a clear error explains the mismatch.
```

This is the explore → direct pipeline: exploratory runs seed the directed suite.

### Duration budget

Exploratory runs take longer than directed ones. Budget 10–30 minutes for focused exploration, longer for adversarial or dogfooding sessions.

---

## Workflow: Improve

Two-pass self-improvement: an analysis pass produces findings as a checklist, a fix pass works through them. The system improves itself through its own playtest infrastructure.

### Pipeline

```
Pass 1 (Analyze): Read-only review → findings as - [ ] checklist
     ↓
Human review: Approve / reject / edit findings before fix pass
     ↓
Synthesize: Turn approved findings into specific fix specs
     ↓
Pass 2 (Fix): Work through SPECS, not raw checklist → fix → mark [x]
     ↓
Verify: Re-run relevant playtests to confirm fixes work
```

### Pass 1: Analyze (read-only)

Review the system. Produce findings as checklist items in `playtests/analysis-YYYY-MM-DD.md`:

```markdown
# Analysis: Code Review

## Architecture
- [ ] `server.ts` mixes routing and business logic — extract handlers #refactor
- [ ] Error responses use 3 different formats across endpoints #consistency
- [ ] No request validation on POST /users — any shape accepted #bug

## Documentation
- [ ] README says `npm start` but package.json uses `deno task serve` #docs

## Testing
- [ ] No coverage for the retry logic in queue processor #testing
```

| Type | What to look for |
|------|------------------|
| **Code review** | Architecture drift, inconsistency, dead code, missing error handling |
| **Doc review** | Outdated instructions, missing sections, broken links |
| **API audit** | Inconsistent response formats, missing validation, unclear errors |
| **DX audit** | Confusing CLI output, poor help text, missing examples |
| **Security scan** | Exposed secrets, missing auth checks, injection vectors |
| **Performance** | Obvious N+1 queries, missing indexes, unbounded lists |

**Rules:** every finding is **specific and actionable** ("POST /users returns 500 on duplicate email, should return 409 with message" — not "improve error handling"). Every finding gets a tag (`#bug`, `#refactor`, `#docs`, `#testing`, `#consistency`, `#security`). Don't fix anything in this pass.

### Human checkpoint (critical)

Between analyze and fix, a human reviews:
- Remove false positives
- Adjust scope (some findings too big for a quick fix)
- Prioritize / reorder
- Add missing context

The human can also add findings the agent missed. The checklist is collaborative.

### Synthesize: raw findings → fix specs

This is the bridge. The raw checklist says WHAT's wrong; the spec says HOW to fix. For each approved finding:

```markdown
### Finding: No request validation on POST /users
**File:** src/routes/users.ts:87
**Current:** POST handler accepts any shape, no validation
**Fix:** Add zod schema validation at handler entry:
  - Define `CreateUserSchema = z.object({ email: z.string().email(), name: z.string().min(1) })`
  - Parse request body with `CreateUserSchema.parse(body)` before processing
  - Return 400 with validation errors on failure
**Test:** POST with missing email → expect 400 with `{error: "email is required"}`
```

**Not:** "Fix POST /users error handling" — too vague. The fixer would have to re-understand the problem.

#### Continue vs spawn for the fix pass

| Situation | Do | Why |
|-----------|-----|-----|
| Analyzer already loaded the target files | Continue (SendMessage) | Context reuse |
| Fix is in a different area than analysis | Spawn fresh (Agent) | Avoid context noise |
| Multiple independent fixes | Fan out fresh agents | Parallelism |

### Pass 2: Fix

Work through the **synthesized fix specs** (not the raw checklist). For each:

1. Read the finding
2. Implement the fix
3. Run relevant tests
4. Mark `- [x]` with a resolution

```markdown
# Analysis: Code Review (FIXES IN PROGRESS)

## Architecture
- [x] [fixed: extracted to handlers/user.ts, handlers/auth.ts] `server.ts` mixes routing and business logic #refactor — 4m
- [x] [fixed: standardized on {error, message, code} format] Error response formats #consistency — 6m
- [x] [fixed: added zod schema validation] No request validation on POST /users #bug — 3m

## Documentation
- [@] API reference missing 4 endpoints #docs

## Testing
- [~] [deferred: needs design discussion first] Consider real DB tests #testing
```

**Fix rules:**
- Fix one item at a time
- Run tests after each fix (if tests exist)
- If a fix reveals a new issue, add it as `#discovered` under the current item
- Too complex for a quick pass → mark `[~] [deferred: reason]`
- Commit after each logical group of fixes

### Verify

After the fix pass, re-run the relevant playtests:
- Did smoke tests still pass?
- Did the specific issues actually get resolved?
- Did any fixes introduce new problems?

Add to `PLAYTEST-RESULTS.md`:

```markdown
| 2026-03-15 | Analysis | — | 12 findings: 5 bugs, 4 docs, 3 refactor |
| 2026-03-15 | Fix pass | Partial | 9/12 fixed, 2 deferred, 1 in progress |
| 2026-03-15 | Smoke (re-run) | Pass | All green after fixes |
```

### The recursive loop

Fixes surface new issues. New issues motivate new playtests:

```
Analyze → findings → fix → verify → analyze again
     ↑                                    ↓
     └──── new playtest ←── new finding ──┘
```

Most powerful when the system under test IS the tool you're testing it with. If the analyze pass itself is painful, that's a finding. If the fix pass keeps hitting the same infrastructure friction, that's a finding.

### When to run Improve

- After a major feature lands — "did we break or miss anything?"
- Periodically — weekly/monthly health check
- After onboarding a contributor — "what confused you?"
- When tech debt feels like it's accumulating
- Before a release — confidence check

---

## What makes a good playtest run

A run is valuable when it produces **specific, surprising findings** — not when all boxes are checked.

- Findings are specific and actionable, not generic ("error handling could be improved")
- At least one "huh" moment — something the team didn't know
- Positive discoveries count too — "users do X in a way we didn't design for, and it's actually useful"
- A run where everything passes is fine but less valuable than one that finds something weird

## Replayable playtests

Directed (Run) playtests are replayable — write once, run after every major change. Especially valuable for:

- **Refactors** — "does the system still work like before?" Run the same playtests against the new code.
- **System mechanics** — multi-session state, crash recovery, agent isolation, workspace forking.
- **Multi-step orchestration** — scenarios with human steps between agent runs (restart server, fork workspace, resume in different session). Use HTML comments to guide the operator between tasks.

### Ideas for replayable playtests

- **Session persistence** — agent writes a file in session 1, a different agent finds it in session 2.
- **Memory without disk** — agent memorizes a passphrase in session 1, recalls it in session 2 without any file.
- **Isolation** — agent verifies cwd, branch, status to confirm worktree isolation isn't leaking.
- **Parallel divergence** — fork from a baseline, two agents take different approaches, verify no cross-contamination.
- **Crash recovery** — kill mid-operation, restart, verify clean recovery.
- **Permission boundaries** — agent tries to access out-of-scope resources; verify proper errors, not silent success.

## When to write a new playtest

- New feature → "what would a creative user try that we didn't intend?"
- Bug found in the wild → "what playtest would have caught this?"
- A run surfaces surprise → "this area is richer than we thought"
- System feels fragile → "I'm not confident this holds up"
- Gut feeling → cheap to author, expensive bugs to miss

## Emitting tasks for big findings

Small findings stay in playtest results (resolution brackets). Findings too big to note and move on — design flaws, fundamental gaps, things needing a human decision — go to the project's `TASKS.md`:

```markdown
- [ ] Permission system doesn't check nested resource access — found during adversarial playtest #found #security
- [ ] CLI piping assumes CSV but list outputs TSV — design decision needed #found #design
```

Tag with `#found` so it's traceable back to the playtest. The playtest is for discovery; `TASKS.md` is for follow-up. See `/fold:tasks` for the task system.

**For `confused` / `fail` findings with a non-obvious root cause** — the kind that cost you >5 minutes to diagnose — also file as a durable entry in the project's `GOTCHAS.md`. The playtest result captures *that it happened*; the gotcha captures *the rule so it doesn't bite again*. See `fold:audit/gotchas.md` for the format.

## Anti-patterns

- **Don't write a playtest for what a unit test can catch.** `assertEquals(f(x), y)` is a test. Save playtests for judgment-call territory.
- **Don't fix things in the Analyze pass.** Read-only is the whole point — produce findings, not patches. Fixing as you go contaminates the human-review checkpoint.
- **Don't escalate risk tiers when smoke fails.** If `none`/`low` fails, stop. Running `medium`/`high` against a broken system burns real state.
- **Don't fabricate duration timestamps.** If timing isn't meaningful, skip it. Filling the format with made-up numbers makes spike detection useless.
- **Don't write a generic finding.** "Error handling could be improved" isn't actionable. Name the command, the input, the output, the expectation.
- **Don't run a fix pass off the raw checklist.** Synthesize specs first — the raw finding says what's wrong, the spec says how. Otherwise the fixer re-derives the problem.
- **Don't split multi-step tasks into micro-steps at execution time.** Execute the full flow as one operation; report the outcome.
