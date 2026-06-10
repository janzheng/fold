# fold

Discover, track, improve — fold again. Three skills that create a self-improving project loop.

```
        discover
       (playtest)
        /      \
      /          \
   track ——— improve
  (mxit)    (autorefine)
```

## Structure

```
fold/
├── README.md          # What fold is and why it works
├── MXIT_SPEC.md       # mxit format specification (v0.3)
├── PLAYTEST_SPEC.md   # Playtest methodology spec
├── deno.json          # mxit parser/CLI (Deno project)
├── src/               # mxit parser, validator, CLI code
├── skills/                # All fold skills (canonical)
│   ├── fold:11star/       # UX 11-star rating + levelling
│   ├── fold:audit/        # Read-only deep codebase audit
│   ├── fold:debug/        # Root-cause one known bug, then fix
│   ├── fold:autorefine/   # Autonomous refinement loop
│   ├── fold:tasks/        # Task format + tracking (aka mxit)
│   ├── fold:brief/   # Single-topic execution brief
│   ├── fold:explore/ # EXPLORE files (ideas → brainstorms → specs)
│   ├── fold:run/     # Task lifecycle runner
│   ├── fold:playtest/     # Playtest umbrella — write + run + explore + improve modes
│   └── _archive/          # Unregistered-from-hub skills, kept for revivability — see "Archived skills" below
```

## Skills

| Skill | What it does |
|-------|-------------|
| `fold:11star` | Rate + improve product UX on the 11-star scale |
| `fold:audit` | Deep read-only codebase audit — race conditions, swallowed errors, security, wiring failures |
| `fold:debug` | Root-cause one known bug — reproduce, trace the causal chain, confirm before fixing, fix test-first |
| `fold:autorefine` | Iterative improvement — rubric negotiation, modify → judge → keep/discard |
| `fold:tasks` | Track work as markdown checklists — statuses, tags, due dates, agent coordination (aka mxit) |
| `fold:brief` | Single-topic execution brief from investigation → handoff |
| `fold:explore` | EXPLORE files — stray thoughts → brainstorms → specs |
| `fold:run` | Task lifecycle runner — recover, ready, claim, done, fail |
| `fold:playtest` | Playtest umbrella — `run` (directed), `explore` (fresh eyes / adversarial), `improve` (analyze → fix) |

## Archived skills — `skills/_archive/`

Skills that were unregistered from the hub live under `skills/_archive/<name>/SKILL.md` with an HTML-comment header explaining when, why, and how to revive. Two batches today:

- **2026-04-30** (commit `f9706c6c`, "round 1 triage"): `fold`, `fold:ship`, `fold:verify`, `fold:mxit:change`, `fold:mxit:spec`, `fold:mxit:tests`. Quoted reasons per file.
- **2026-05-05** (playtest consolidation): `fold:playtest:run`, `fold:playtest:explore`, `fold:playtest:improve` were folded into `fold:playtest` and parked. **2026-05-13**: moved into `_archive/` for consistency.

The `_archive/` location alone prevents auto-loading — no `.parked.md` suffix needed. Never delete from `_archive/`; it's home, not transitional. Revival instructions are inside each file's header.

## The fold loop

1. `/fold:playtest` in explore mode → discover what's wrong/weird/interesting
2. Emit findings as mxit tasks in `TASKS.md` with `#found` tag
3. `/fold:autorefine` the weakest parts → iterate until quality converges
4. `/fold:playtest` in run mode → verify improvements
5. Fold again

## Project persistence artifacts

Projects using fold keep three durable files at the root:

- **`TASKS.md`** — active work (mxit format)
- **`PLAYTEST-RESULTS.md`** — one-line-per-run log of playtest sessions
- **`GOTCHAS.md`** — debug traps that cost >5 min to figure out (append-only; never delete; supersede in place). Graduates to `pitfalls.md` once a trap bites ≥2 places.

`TASKS.md` is session-scale; `GOTCHAS.md` is institutional memory. Format spec for GOTCHAS: `skills/fold:audit/gotchas.md`.

## Using individual skills

Each skill works standalone. Use `fold:tasks` (the renamed mxit) when you want just the task format without the full loop.

## mxit CLI

```bash
deno task mxit ready TASKS.md --json     # Show actionable tasks
deno task mxit validate TASKS.md         # Check format errors
deno task mxit claim TASKS.md 5 --agent claude-1
deno task mxit done TASKS.md 5 --result "fixed the bug"
deno task mxit fail TASKS.md 5 --error "timeout"
deno task mxit recover TASKS.md          # Reset crashed [@] tasks
deno task mxit run TASKS.md              # Full loop: recover → ready → show
```

## Ecosystem context

fold is the methodology layer. Related projects (see README for full map):

- **underproof** — Editor + executor. Has a forked mxit with extensions (resolution brackets, tid, execution pipeline). These should be upstreamed to fold as mxit v1.0.
- **expo** — Multi-agent orchestrator. Signal bus, race, review loops.
- **brigade** — Job queue experiment. Copies from expo + mxit. 88 known audit findings.
- **snapshot** — Git-based rollback. Used by autorefine.
- **mcp-hub** — Skill distribution. fold skills at `mcp-hub/skills/fold:*`.

Research on comparable tools (OpenSpec, Beads, Hermes) with concrete improvement recommendations: `github-repos/_workshop/openspec-beads-vs-fold-mxit.md`
