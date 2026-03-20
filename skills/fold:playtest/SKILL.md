---
name: fold:playtest
description: Write agentic playtests — the "discover" facet of fold. An LLM agent — an LLM agent plays with your system like a creative, distracted, clever human would. Finds loopholes, boundary cases, design bugs, surprising usage patterns, and "huh" moments that test suites can't catch. Use when the user says "playtest this", "try to break it", "what's weird about this", or wants discovery beyond what scripts can test.
---

# Agentic Playtesting

Playtesting comes from game development: put a real player in front of the game and watch what happens. They don't follow a script — they poke at edges, try weird things, get distracted, find loopholes, and discover mechanics the designers never intended.

Agentic playtesting is the same thing, but the player is an LLM agent.

The agent operates your system as a creative, curious, sometimes adversarial user would. The goal isn't verification (tests do that). The goal is **discovery** — "huh" moments:

- "Huh, this crashes if you do X then Y really fast"
- "Huh, the permission system doesn't check this path"
- "Huh, people are using this feature in a way we never intended — that's actually genius"
- "Huh, this game mechanic is exploitable"
- "Huh, the error message here is useless"

## When to playtest (not unit test)

- `assertEquals(f(x), y)` → write a test
- "What breaks if someone does something dumb?" → playtest
- "What happens at the edges?" → playtest
- "Is this design actually fun / usable / robust?" → playtest
- "What would a clever adversary try?" → playtest

If a script can already test it, don't write a playtest for it. Playtests are for the things scripts CAN'T catch: judgment calls, creative misuse, workflow friction, design flaws, and unknown unknowns.

## Playtest format

Playtest files are markdown checklists. Each task is a natural language goal using checkbox syntax:

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

### Example playtest file

```markdown
# CLI Boundary Testing

## Weird inputs (risk: none)

- [ ] Run every command with no arguments, wrong types, and absurdly long strings. Report which ones crash vs give helpful errors.
- [ ] Try piping commands together in ways the docs don't mention. What works? What fails silently?

## Race conditions (risk: low)

- [ ] Run the same create command twice simultaneously. Does it duplicate? Error? Silently overwrite?
- [ ] Start a long operation, then interrupt it halfway. Is the state corrupted or recoverable?

## Creative misuse (risk: low)

- [ ] Try to use the system in a way it wasn't designed for but a clever user might attempt. Report what happens and whether it's useful or dangerous.
```

### After execution — results

Mark `[x]` and add a resolution bracket describing what you found:

```markdown
- [x] [found: `create` with no args gives "error" with no context — no usage hint, no flags listed] Weird inputs
- [x] [found: piping list→export fails silently because list outputs tabs but export expects CSV] Command piping
- [x] [pass: interrupt mid-create leaves clean state, no corruption] Interrupt handling
- [x] [found: you can use the search command as a poor man's grep across all projects — undocumented but useful] Creative misuse
```

Resolution format: `[keyword: what happened]`

### Resolution keywords

| Keyword | Meaning |
|---------|---------|
| `found` | Discovered something — a bug, a loophole, a clever usage pattern, a design flaw |
| `fail` | System misbehaved — crash, wrong output, silent corruption |
| `confused` | Got stuck on UX/DX — system works but is hard to use or understand |
| `pass` | System handled it well — no issues found |
| `blocked` | Couldn't attempt — dependency missing, system down |

### Duration and cost (optional)

Duration and cost annotations are useful when humans review results — spikes signal the agent was struggling. But they're optional. Don't fabricate timing just to fill the format. If you're an agent and duration isn't meaningful, skip it.

When included: `— 11s`, `— 2m30s`, `— 31s, $0.12`

## Task granularity

Describe a scenario and what kind of discoveries you're looking for. Not a script, not a vague directive.

```markdown
# Too granular (this is a script — write a test instead)
- [ ] Run `curl localhost:3000/health`
- [ ] Check the response code is 200

# Too broad (agent will thrash)
- [ ] Test everything and report bugs

# Right level — directed discovery
- [ ] Try to create resources with edge-case inputs: empty strings,
  unicode, very long names, special characters. Report which ones
  the system handles gracefully and which ones it chokes on.

# Right level — open exploration
- [ ] Use the CLI for 10 minutes doing real tasks. Report anything
  that surprised you — good or bad. What felt natural? What made
  you go "wait, why does it work like that?"
```

## Tiered risk

Organize by risk, always running safer tiers first:

| Risk | Description | Examples |
|------|-------------|---------|
| `none` | Read-only, no side effects | Smoke tests, code analysis, output review |
| `low` | Creates test data, easily reversible | User creation, file uploads, config changes |
| `medium` | Modifies real state in isolated env | Code changes in branches, staging migrations |
| `high` | Affects production or shared state | Deployment, data migration, external API calls |

Use headings to group by risk: `## Smoke (risk: none)`, `## Deploy (risk: high)`

If smoke tests fail, skip higher tiers.

## What makes a good playtest run

A playtest run is valuable when it produces **specific, surprising findings** — not when all boxes are checked. The best runs surface things nobody anticipated.

- Findings are specific and actionable, not generic ("error handling could be improved")
- At least one "huh" moment — something the team didn't know about their system
- Positive discoveries count too — "users can do X in a way we didn't design for, and it's actually useful"
- A run where everything passes is fine but less valuable than a run that finds something weird

## Results history

Track results in `PLAYTEST-RESULTS.md` alongside the playtest file:

```markdown
# Playtest Results

| Date | Playtest | Result | Notes |
|------|----------|--------|-------|
| 2026-03-13 | CLI boundaries | 4 found | Silent failures on pipe chaining, undocumented search-as-grep trick |
| 2026-03-14 | Race conditions | 2 found | Duplicate creation on simultaneous calls, state corruption on interrupt |
| 2026-03-15 | Fresh eyes | Mixed | Onboarding smooth, but config system is confusing — 3 "wait, what?" moments |
```

## Two modes

**Directed** — specific goals, explicit pass criteria. Use `/fold:playtest:run`.

**Exploratory** — open-ended goals, agent decides what to look for. Use `/fold:playtest:explore`.

Both produce checklist results. Exploratory findings can seed new directed playtests.

## Replayable playtests

Directed playtests are replayable — write them once, run them after every major change. This is especially valuable for:

- **Refactors** — "does the system still work the way it did before?" Run the same playtests against the new code.
- **System mechanics** — things that can't be scripted as unit tests but need verification: multi-session state, crash recovery, agent isolation, workspace forking.
- **Multi-step orchestration** — scenarios with human steps between agent runs (restart a server, fork a workspace, resume in a different session). Use HTML comments to guide the operator between tasks.

### Ideas for replayable playtests

- **Session persistence** — agent writes a file in session 1, a different agent finds it in session 2. Proves state survives across sessions.
- **Memory without disk** — agent memorizes a secret passphrase in session 1, recalls it in session 2 without any file to read. Proves conversation memory works.
- **Isolation** — agent checks its working directory, git branch, and git status to verify it's operating in the right sandbox. Proves worktree isolation isn't leaking.
- **Parallel divergence** — fork from a common baseline, two agents take different approaches, verify no cross-contamination between the forks.
- **Crash recovery** — kill a process mid-operation, restart, verify the system recovers to a clean state.
- **Permission boundaries** — agent tries to access resources outside its scope and verifies it gets proper errors, not silent success.

Write these as plain markdown with clear goals. They read like checklists but require an agent to actually operate the system — that's what makes them playtests, not scripts.

## When to write a new playtest

- New feature → "what would a creative user try to do with this that we didn't intend?"
- Bug found in the wild → "what playtest would have caught this before a user did?"
- Playtest surfaces surprise → "this area is richer than we thought, write a dedicated playtest"
- System feels fragile → "I'm not confident this holds up under weird usage"
- Gut feeling → cheap to author, expensive bugs to miss

## File layout

```
project/
├── playtests/
│   ├── boundaries.md         # Edge cases, weird inputs, race conditions
│   ├── fresh-eyes.md         # New user perspective, onboarding friction
│   ├── adversarial.md        # Try to break permissions, abuse mechanics
│   └── PLAYTEST-RESULTS.md   # History of all runs
└── ...
```

## Emitting tasks for big findings

Small findings stay in the playtest results (resolution brackets). But when you find something too big to note and move on — a design flaw, a fundamental gap, something needing human decision — emit it as a task in the project's `TASKS.md`:

```markdown
- [ ] Permission system doesn't check nested resource access — found during adversarial playtest #found #security
- [ ] CLI piping assumes CSV but list outputs TSV — design decision needed #found #design
```

Tag with `#found` so it's traceable back to the playtest. The playtest is for discovery; `TASKS.md` is for follow-up.

## Related skills

- `/fold:playtest:run` — Execute directed playtests
- `/fold:playtest:explore` — Run exploratory playtests
- `/fold:playtest:improve` — Analyze → fix pipeline (findings become fixes)
