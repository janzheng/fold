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
├── skills/            # All fold skills
│   ├── mxit/          # Task format and tracking
│   ├── mxit:run/      # Task runner and orchestration
│   ├── playtest/      # Write playtests (discovery)
│   ├── playtest:run/  # Execute directed playtests
│   ├── playtest:explore/  # Exploratory playtesting
│   ├── playtest:improve/  # Analyze → fix pipeline
│   └── autorefine/    # Autonomous refinement loop
```

## Skills

| Skill | What it does |
|-------|-------------|
| `mxit` | Track work as markdown checklists — statuses, tags, due dates, agent coordination |
| `mxit:run` | Run the task lifecycle — recover, ready, claim, done, fail |
| `playtest` | Write playtests — discovery-focused, not QA verification |
| `playtest:run` | Execute directed playtests against real systems |
| `playtest:explore` | Open-ended exploration — fresh eyes, adversarial, ergonomics |
| `playtest:improve` | Analyze → fix pipeline with human checkpoint |
| `autorefine` | Iterative improvement — rubric negotiation, modify → judge → keep/discard |

## The fold loop

1. `/playtest:explore` the project → discover what's wrong/weird/interesting
2. Emit findings as mxit tasks in `TASKS.md` with `#found` tag
3. `/autorefine` the weakest parts → iterate until quality converges
4. `/playtest:run` directed playtests to verify improvements
5. Fold again

## Using individual skills

Each skill works standalone. Use `fold:mxit` naming when you want just the task format without the full loop.

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
