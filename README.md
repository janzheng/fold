# Fold

Fold is the home of the Project Workflows (`proj:*`) skill set and the mxit
Markdown task parser/CLI. The project remains named Fold; only the skill command
prefix changed from `fold:` to `proj:`.

## Skills

`skills/` contains all 20 active `proj:*` skills. `proj:start` routes a request
when you are unsure which one to use.

| Work | Skills |
| --- | --- |
| Plan and hand off | `proj:explore`, `proj:brief`, `proj:tasks`, `proj:delegate`, `proj:run` |
| Keep project records | `proj:checkpoint`, `proj:journal`, `proj:note`, `proj:research`, `proj:runlog`, `proj:lessons`, `proj:changelog` |
| Investigate and improve | `proj:debug`, `proj:audit`, `proj:playtest`, `proj:11star`, `proj:agent-ready`, `proj:instruction-audit`, `proj:tuneup` |

Eight skills (`proj:11star`, `proj:audit`, `proj:brief`, `proj:debug`,
`proj:explore`, `proj:playtest`, `proj:run`, `proj:tasks`) are authored here.
The other twelve are portable snapshots of canonical sources in MCP Hub's
`skills-workshop/`. The source map there is `skills-workshop/proj-sources.json`.
Edit the owning source first, then refresh this snapshot and Hub's registry,
backup, and installed copies. Do not author in an installed skill directory.

## Install on another computer

Clone this repository, then run from its root:

```bash
bash install-skills.sh
```

The installer copies only active `proj:*` skills to `~/.claude/skills/`,
`~/.agents/skills/` (Codex), and `~/.cursor/skills/`. It leaves other skills
alone and saves any replaced same-name directories outside the loaders under
`~/.local/state/fold/skill-backups/`. It does not install archived skills or
the mxit CLI. Restart agent sessions to pick up the installed skills.

These skills refer to your project files and, in a few examples, Jan's project
layout; a fresh laptop also needs access to the relevant projects and tools.
To install the optional mxit CLI, install [Deno](https://deno.com/) and run
`deno task install` from this repository. Otherwise the Markdown workflows
can be used without the CLI.

## Development

```bash
deno task test
deno task check
deno task mxit validate /path/to/project/TASKS.md
```

The parser format is documented in [MXIT_SPEC.md](MXIT_SPEC.md); playtest
methodology is in [PLAYTEST_SPEC.md](PLAYTEST_SPEC.md). Retired `fold:*` skills,
`proj:autorefine`, and the earlier project overview live under
[_archive/](_archive/README.md), outside the active skill loader path.
