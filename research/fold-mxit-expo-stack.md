# The Fold Stack: mxit + expo + fold

> **Note:** The canonical ecosystem map now lives in fold's README at `/Users/janzheng/Desktop/Projects/_deno/apps/fold/README.md` (see "Ecosystem" section). This document is preserved for its deeper analysis of the mxit+expo+fold composition pattern.

*Deep dive — three loosely coupled projects that together form a lightweight alternative to Paperclip-style control planes.*

## The stack

```
fold        — the quality loop (discover → track → improve)
mxit        — the task system (what to do, dependencies, statuses)
expo        — the execution engine (spawn agents, signal bus, orchestration)
```

Each works independently. Together they compose into something more:

| Layer | Project | Job | Can be used alone? |
|-------|---------|-----|-------------------|
| **What** | mxit | TASKS.md, dependencies, readiness | Yes — any project |
| **How** | expo | Spawn agents, signal bus, review loops | Yes — any CLI agent |
| **Quality** | fold | Playtest → track → autorefine → repeat | Yes — any codebase |

## How they compose

```
1. mxit computes what's ready (TASKS.md → ready tasks)
2. expo spawns agents to do the work (worktrees, signal bus)
3. fold ensures quality (playtest discovers, autorefine improves)
4. Results flow back: expo signals → update TASKS.md → mxit tracks
```

No server needed. No database. Just markdown files + JSONL bus + CLI agents.

## The Paperclip comparison

Paperclip (control plane for AI companies) solves the same problem but with a server, database, React UI, org charts, budgets, and approval gates. The fold stack solves it with:

| Paperclip | Fold stack |
|-----------|-----------|
| PostgreSQL database | TASKS.md (markdown files) |
| REST API server | expo CLI (spawns processes) |
| React dashboard | TUI cards / tmux consumer |
| Org charts | TASKS-DESIGN.md team section |
| Budget enforcement | Convention tags (`~$0.XX` in resolution brackets) |
| Atomic checkout (409) | Advisory claims (`[@agent]`) |
| Approval gates | `#needs-approval` tag |
| Goal hierarchy | `#goal:name` tags |
| Heartbeat scheduler | `[heartbeat: timestamp]` convention |

The fold stack trades enforcement for simplicity. No server to run, no database to manage, works in any git repo. The tradeoff: advisory instead of atomic, convention instead of enforcement. Fine for 1-5 agents, not for 20+.

## Why expo matters

Without expo, fold:mxit:run is prompt-driven — the agent reads TASKS.md and self-orchestrates. This works but has no:
- Signal visibility (what's the agent doing right now?)
- Cross-agent bus (multiple agents can't see each other)
- Crash detection (agent dies, nobody knows)
- Cost tracking (no token usage data)

Expo adds all of these without adding a server. The signal bus (JSONL) is the primitive — orchestrators, UIs, cost trackers, and escalation handlers are all consumers of the same stream.

## Multi-agent support

Currently expo supports Claude Code and Codex. The adapter architecture is clean:

```
claude-adapter.ts   — stream-json → AgentSignal
codex-adapter.ts    — Codex JSON → AgentSignal
generic-adapter.ts  — any CLI → lifecycle signals (spawned/output/done/failed)
```

Adding new agents is just writing an adapter:
- **OpenCode** — `opencode run --format json` already outputs structured JSON events
- **Pi-mono** — check for structured output mode, otherwise generic adapter works
- **Any CLI** — generic adapter handles lifecycle signals for anything

The signal bus doesn't care what produced the signal. Claude, Codex, OpenCode, a shell script — they all emit `AgentSignal` and the bus multiplexes them.

## The bigger picture

This stack isn't just for Claude Code power users. Any agent orchestration system that can:
1. Read TASKS.md for work
2. Spawn a CLI process
3. Write to a JSONL bus

...can use the fold stack. Pi-mono, OpenCode, cron jobs, CI pipelines, custom scripts. The consumer doesn't matter — the protocols (markdown tasks, JSONL signals) are the interface.

This is the Paperclip insight (separate control plane from execution) without the Paperclip weight (no server, no database, no React UI). File-native orchestration.

## Open questions

- Should expo read TASKS.md directly, or should there be a thin bridge?
- How do expo's review/race/ralph patterns map to mxit:run's find→work→review→mark loop?
- Should the signal bus feed back into TASKS.md automatically (agent done → mark `[x]`)?
- At what scale does the advisory model break and you need real locking?

## Canonical locations

- **mxit:** `/Users/janzheng/Desktop/Projects/_deno/apps/mxit/`
- **expo:** `/Users/janzheng/Desktop/Projects/_deno/apps/expo/`
- **fold:** `/Users/janzheng/Desktop/Projects/_deno/apps/fold/`
- **Skills (distribution):** `/Users/janzheng/Desktop/Projects/mcp-hub/skills/`
