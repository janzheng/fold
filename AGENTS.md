# Fold Agent Instructions

Fold is the project name. Active skills use the `proj:` prefix; mxit remains the
name of the task format and CLI. Read `README.md` for the current inventory and
`_archive/README.md` for retired skills. Do not use or install `fold:*` commands
from the archive.

Author the eight Fold-owned skills in `skills/proj:*/`. The thirteen workshop-owned
skills in that folder are portable snapshots; edit their canonical MCP Hub
`skills-workshop/proj:*/` source before refreshing them. MCP Hub's
`skills-workshop/proj-sources.json` lists ownership. Its registry, backup, and
global installations are distribution copies.

For task work, use `proj:tasks` and the project's existing TASKS file. Claim a
tracked task with a stable session-specific `[@owner]` label before starting;
preserve other sessions' claims. Keep task entries short and link substantial
reasoning or progress to a brief, journal, or runlog. Use `proj:checkpoint`
after meaningful work and before a handoff; do not infer permission to commit,
push, publish, or deploy from a checkpoint.

The mxit parser and CLI live in `src/`; its format spec is `MXIT_SPEC.md`.
Run `deno task test` and `deno task check` after changing parser behavior.
