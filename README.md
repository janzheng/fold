# fold

Three tools for AI agents working on projects: discover issues (playtest), track work (mxit), and improve iteratively (autorefine). Each works standalone. Together they form a loop.

## How it works

The repo has three things:

- **mxit** — a markdown-native task format and CLI. Tasks live in `TASKS.md` with statuses, tags, due dates, and multi-agent support. The CLI parses, validates, and operates on task files.
- **playtest** — a methodology for agentic testing. An LLM agent uses your system like a creative human would — poking at boundaries, trying weird inputs, finding things unit tests can't catch. Results are recorded as markdown checklists.
- **autorefine** — an iterative improvement loop. Agent and user agree on what "better" means (a rubric), then the agent makes one change at a time, judges whether it helped, keeps or discards, and repeats until quality converges.

The loop: playtest finds issues → mxit tracks them → autorefine improves the weakest parts → playtest again to verify.

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
└── skills/                # Claude Code skills
    ├── mxit/              # Task format and tracking (with bundled scripts)
    ├── mxit:run/          # Task runner and orchestration
    ├── playtest/          # Write playtests
    ├── playtest:run/      # Execute directed playtests
    ├── playtest:explore/  # Exploratory playtesting
    ├── playtest:improve/  # Analyze → fix pipeline
    └── autorefine/        # Autonomous refinement loop
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

Each skill is a `SKILL.md` file that teaches an AI agent a capability. Install by copying to `~/.claude/skills/`:

| Skill | Purpose |
|-------|---------|
| `mxit` | Read and write TASKS.md files |
| `mxit:run` | Run the task lifecycle (claim → work → done/fail) |
| `playtest` | Write discovery-focused playtests |
| `playtest:run` | Execute directed playtests |
| `playtest:explore` | Open-ended exploratory testing |
| `playtest:improve` | Analyze → fix pipeline |
| `autorefine` | Iterative improvement with rubric negotiation |

## Running tests

```bash
deno task test    # 49 tests
deno task check   # Type-check
```

## License

MIT
