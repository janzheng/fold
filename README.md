# fold

Three tools for AI agents working on projects: discover issues (playtest), track work (mxit), and improve iteratively (autorefine). Each works standalone. Together they form a loop.

## How it works

The repo has three things:

- **mxit** — a markdown-native task format and CLI. Tasks live in `TASKS.md` with statuses, tags, due dates, and multi-agent support. The CLI parses, validates, and operates on task files.
- **playtest** — a methodology for agentic testing. An LLM agent uses your system like a creative human would — poking at boundaries, trying weird inputs, finding things unit tests can't catch. Results are recorded as markdown checklists.
- **autorefine** — an iterative improvement loop. Agent and user agree on what "better" means (a rubric), then the agent makes one change at a time, judges whether it helped, keeps or discards, and repeats until quality converges.

The loop: playtest finds issues → mxit tracks them → autorefine improves the weakest parts → playtest again to verify.

Projects using fold accumulate three persistent artifacts in their root: **`TASKS.md`** (active work, via mxit), **`PLAYTEST-RESULTS.md`** (one-line-per-run summary log), and **`GOTCHAS.md`** (durable debug-trap log — anything that cost you >5 minutes to figure out). The first two are session-scale; GOTCHAS is institutional memory. See `skills/fold:audit/gotchas.md` for the GOTCHAS format and graduation path.

Other artifact folders accumulate as projects grow: `.journal/` (lab notebook), `.brief/` (converged design docs), `.notes/` (atemporal findings), `.ticket/` (delegation slips), `EXPLORE.md` (sketchbook), and **`sops/`** (multi-step operating procedures humans walk through — the thing skills *can't* be, since skills are agent-triggerable capabilities). See `skills/fold:tasks/SKILL.md` for the full artifact set.

## How to use

### The full fold loop

Use all three together to systematically improve a project:

1. **Discover** — run `/playtest:explore` on your project. The agent uses the system as a creative, adversarial user. It finds bugs, friction, loopholes, and surprising usage patterns.
2. **Track** — big findings get emitted as mxit tasks in `TASKS.md` with `#found` tags. Small findings stay in playtest results.
3. **Improve** — run `/autorefine` on the weakest parts. The agent negotiates a rubric with you, then iterates: one change → judge → keep or discard → repeat.
4. **Verify** — run `/playtest:run` with directed playtests to confirm the improvements actually helped.
5. **Fold again** — repeat from step 1. Each pass makes the project stronger.

### Autorefine only

Use when you know something needs improvement but aren't sure how:

1. Run `/autorefine` and point it at the artifact (a file, a skill, a doc, a config).
2. The agent asks you what "better" means — push for specifics but subjective answers are fine.
3. You approve a rubric. The agent baselines, then loops: modify → judge → keep/discard.
4. When quality converges (3 consecutive discards, or you're happy), it stops and reports what worked.

Two grading modes: **scored** (numeric, for things you can measure) and **comparative** (the wine taster — read old vs new, which would you rather have?).

### Playtesting only

Use when you want discovery — find out what's wrong, weird, or interesting:

- `/playtest:explore` — open-ended. Fresh eyes, adversarial probing, ergonomics review. The agent decides what to look for.
- `/playtest:run` — directed. You write specific scenarios, the agent executes them and judges the results.
- `/playtest:improve` — the analyze→fix pipeline. One pass finds issues, a human reviews, a second pass fixes them.

Playtest findings use resolution keywords: `found` (discovered something), `fail` (system misbehaved), `confused` (UX friction), `pass` (handled it well), `blocked` (couldn't attempt).

### Task tracking only (mxit)

Use when you just want markdown-native task management, no loop:

1. Create a `TASKS.md` in your project:

```markdown
# Project Name

## Current

- [ ] First task
- [ ] Second task #backend -> 2026-03-31
  - [ ] Sub-task A
  - [ ] Sub-task B
- [!] Important thing to do first
```

2. Use the CLI to operate on it:

```bash
mxit status TASKS.md    # Summary: 3/5 done, 1 overdue
mxit ready TASKS.md     # What's actionable right now
mxit done TASKS.md 4 --result "shipped it"
```

3. Optionally drop `MXIT_SPEC.md` into your project so agents know the format.

See the mxit format section below for the full syntax.

## Quick start

```bash
# Install mxit CLI globally
deno install --global --allow-read --allow-write --name mxit src/cli.ts

# Or run directly
deno task mxit ready TASKS.md
deno task mxit validate TASKS.md
deno task mxit status TASKS.md
```

The skills are in `skills/` — drop them into `~/.claude/skills/` (or your project's `.claude/skills/`) to use them with Claude Code.

## Project structure

```
fold/
├── README.md              # This file
├── CLAUDE.md              # Project conventions for agents
├── MXIT_SPEC.md           # mxit format spec (v0.3)
├── PLAYTEST_SPEC.md       # Playtest methodology spec
├── deno.json              # Deno project config
├── src/                   # mxit parser + CLI
│   ├── cli.ts             # CLI: ready, validate, claim, done, fail, recover, status, list, add
│   ├── parse.ts           # Markdown → Task[] parser
│   ├── serialize.ts       # Task[] → Markdown serializer
│   ├── validate.ts        # Format error detection
│   ├── ready.ts           # Actionable task filtering (respects children, blocked-by, stuck)
│   ├── fileops.ts         # claim, complete, fail, recover, add, discover operations
│   ├── types.ts           # Task, Tag, Resolution, DueDate types
│   └── mod.ts             # Library exports
└── skills/                # Claude Code skills (canonical)
    ├── fold:11star/       # UX 11-star rating + levelling
    ├── fold:audit/        # Read-only deep codebase audit
    ├── fold:debug/        # Root-cause one known bug, then fix
    ├── fold:autorefine/   # Autonomous refinement loop
    ├── fold:tasks/         # Task format and tracking
    ├── fold:brief/   # Single-topic execution brief
    ├── fold:explore/ # EXPLORE files (ideas → brainstorms)
    ├── fold:run/     # Task lifecycle runner
    ├── fold:playtest/     # Playtest umbrella (write + run + explore + improve modes)
    └── _archive/          # Unregistered-from-hub skills, kept for revivability — see "Skills" section below
```

## mxit CLI

```
mxit ready    <file> [--json]               Show actionable tasks
mxit list     <file> [--tag T] [--status S] List and filter tasks
mxit status   <file>                        Project summary (counts, overdue)
mxit validate <file>                        Check for format errors
mxit add      <file> <title> [--tag T]      Add a new task
mxit claim    <file> <line> --agent <name>  Claim a task
mxit done     <file> <line> [--result <msg>] Mark complete
mxit fail     <file> <line> --error <msg>   Mark failed (increments #error, adds #stuck at max)
mxit recover  <file>                        Reset crashed [@] tasks to [ ]
mxit check    <file>                        Recover + ready + overdue in one command
```

All mutation commands support `--dry-run`.

## mxit format

mxit ("mix it") is based on [xit!](https://xit.jotaen.net/) by [jotaen](https://github.com/jotaen/xit), extended for markdown and multi-agent workflows. Tasks are markdown checkboxes with extended statuses:

```markdown
- [ ] open task
- [@claude-1] claimed by an agent
- [x] [done: what happened] completed task #tag -> 2026-03-31
- [!] important — prioritize this
- [~] [deferred: reason] no longer relevant
```

See `MXIT_SPEC.md` for the full specification.

## Skills

Each skill is a `SKILL.md` file that teaches an AI agent a capability. The live set is distributed through `mcp-hub` (`mcp-hub/skills/fold:*`) and synced to `~/.claude/skills/`.

| Skill | Purpose |
|-------|---------|
| `fold:11star` | Rate + improve UX on the 11-star scale |
| `fold:audit` | Deep read-only codebase audit (race conditions, swallowed errors, security, wiring) |
| `fold:debug` | Root-cause one known bug — reproduce, trace the causal chain, confirm, fix test-first |
| `fold:autorefine` | Autonomous refinement loop with rubrics or comparative checks |
| `fold:tasks` | Markdown-native task tracking — statuses, tags, dependencies, multi-agent (aka mxit) |
| `fold:brief` | Single-topic execution brief from investigation → handoff |
| `fold:explore` | EXPLORE files — stray thoughts → brainstorms → specs |
| `fold:run` | Task lifecycle runner (ready → claim → done/fail) |
| `fold:playtest` | Playtest umbrella — `run` (directed), `explore` (fresh eyes / adversarial), `improve` (analyze → fix) |

### Archived skills — `skills/_archive/`

Skills that were once hub-registered but unregistered later live under `skills/_archive/<name>/`. They keep their `SKILL.md` and an HTML-comment header noting when and why they were archived (commit reference + reason from the original triage). Two batches today:

- **Unregistered 2026-04-30** via commit `f9706c6c` ("round 1 triage"): `fold`, `fold:ship`, `fold:verify`, `fold:mxit:change`, `fold:mxit:spec`, `fold:mxit:tests`. Reasons quoted in each file's header — "core meta wrapper, never invoked directly" / "rarely used" / "specialized sub-skill."
- **Parked 2026-05-05** when the playtest sub-skills got folded into the `fold:playtest` umbrella: `fold:playtest:run`, `fold:playtest:explore`, `fold:playtest:improve`. Original PARKED notes preserved in each header.

Why a dedicated `_archive/` dir instead of a `SKILL.parked.md` suffix? Two cleaner properties: (1) the location alone prevents auto-loading without needing a special filename, (2) `git mv` records the archive event as a real move so history is auditable. Revival instructions live inside each file's header — `git mv` the dir back out of `_archive/`, drop the comment block, copy to `mcp-hub/skills/`, run `sync-skills.sh`.

**Rule:** never delete from `_archive/`. Canonical is home; the archive is the durable historical record, not transitional.

## Running tests

```bash
deno task test    # 49 tests
deno task check   # Type-check
```

## Inspiration

The autorefine loop is inspired by Karpathy's [autoresearch](https://github.com/karpathy/autoresearch) — an autonomous AI research setup where an agent modifies training code, runs 5-minute experiments, checks if the metric improved, keeps or discards, and loops forever. autoresearch works because `val_bpb` is a single number. fold extends the idea to subjective quality — things where "better" is a judgment call, not a measurement.

## Ecosystem

fold doesn't exist in isolation. It's the methodology layer in a larger stack of interconnected projects:

```
                    ┌─────────────────────────────────────────┐
                    │           METHODOLOGY (fold)            │
                    │                                         │
                    │  playtest ──► mxit ──► autorefine       │
                    │  (discover)  (track)   (improve)        │
                    │                                         │
                    │  + brainstorm (explore before commit)   │
                    │  + brief (design docs)                  │
                    │  + audit (parallel correctness sweep)   │
                    │  + verify (check impl matches spec)     │
                    └──────────────┬──────────────────────────┘
                                   │
          ┌────────────────────────┼────────────────────────┐
          │                        │                        │
    ┌─────▼──────┐          ┌──────▼──────┐          ┌──────▼──────┐
    │  underproof │          │    expo     │          │   brigade   │
    │  (editor +  │          │ (multi-agent│          │ (job queue +│
    │  executor)  │          │ orchestrator│          │  plugins)   │
    │             │          │             │          │             │
    │ ProseMirror │          │ signal bus  │          │ cli-agent   │
    │ task exec   │          │ spawn/race  │          │ coverflow   │
    │ dispatch    │          │ review loop │          │ cron        │
    │ FOH/BOH     │          │ web dash    │          │ HTTP API    │
    └──────┬──────┘          └──────┬──────┘          └──────┬──────┘
           │                        │                        │
           └────────────────────────┼────────────────────────┘
                                    │
                             ┌──────▼──────┐
                             │  snapshot   │
                             │ (git-based  │
                             │  rollback)  │
                             └─────────────┘
```

### Where things live

| Project | Location | What it does |
|---------|----------|-------------|
| **fold** | `/Users/janzheng/Desktop/Projects/__active/_apps/fold` | Canonical home. mxit spec, parser, CLI, all fold skills. The methodology. |
| **mxit** (standalone) | `/Users/janzheng/Desktop/Projects/__active/_apps/mxit` | Standalone mxit CLI (may consolidate into fold) |
| **underproof** | `/Users/janzheng/Desktop/Projects/__active/_apps/underproof` | Markdown editor + task executor. Has its own mxit fork with extensions (resolution brackets, tid, execution pipeline). Proving ground for mxit v1.0 features. |
| **expo** | `/Users/janzheng/Desktop/Projects/__active/_apps/expo` | Multi-agent orchestrator. Signal bus, spawn/race/review patterns, web dashboard. |
| **brigade** | `/Users/janzheng/Desktop/Projects/__resources/workshop/brigade` | Job queue + plugin system. Copies code from expo + mxit. Experimental — has 88 known audit findings. |
| **snapshot** | `/Users/janzheng/Desktop/Projects/__active/_apps/snapshot` | Git-based filesystem rollback. Used by autorefine for safe iteration. |
| **mcp-hub** | `/Users/janzheng/Desktop/Projects/mcp-hub` | Skill distribution hub. fold skills live in `mcp-hub/skills/fold:*` and get synced to `~/.claude/skills/`. |

### Known divergence

Underproof has forked mxit with significant extensions (resolution brackets, due dates, stable task IDs, blocked-by dependencies, execution tags, ProseMirror rendering). These are battle-tested and should be upstreamed into fold's canonical MXIT_SPEC.md as v1.0. See research notes: `github-repos/_workshop/openspec-beads-vs-fold-mxit.md` for the full divergence map and architectural recommendations.

### Research & competitive landscape

Detailed analysis of comparable tools lives in `github-repos/`:
- **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** (34.6k stars) — Spec-driven development for AI agents. Delta specs, archive as decision history, verify against spec. Key ideas to borrow: `changes/` lifecycle, delta spec format, no-code explore mode.
- **[Beads](https://github.com/steveyegge/beads)** (19.8k stars) — Issue tracker for AI agent crews. Hash-based IDs, atomic claiming, agent messaging. Key ideas to borrow: hash task IDs, semantic compaction.
- **[Hermes Agent](https://github.com/NousResearch/hermes-agent)** (13.6k stars) — Self-improving agent with skill creation, bounded memory, session search. Key insight: the self-improvement system is just prompt engineering + tool calling — portable to any framework.

Deep dive with concrete recommendations: `github-repos/_workshop/openspec-beads-vs-fold-mxit.md`

## License

MIT
