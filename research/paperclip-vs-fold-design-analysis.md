# Paperclip vs Fold — Design Analysis

*Deep dive — what can fold learn from Paperclip's control plane architecture, and where does fold's markdown-native approach win?*

## The core difference

**Paperclip** is a control plane for AI companies: server + database + UI. It models the entire corporate structure (org charts, budgets, governance, goal hierarchy) and treats task management as the coordination layer between agents.

**Fold** is a markdown-native project loop: discover → track → improve. It models individual project work with rich task semantics and progressive file types (EXPLORE → BRIEF → TICKET → TASKS).

Paperclip asks: "How do I run a company of 20 agents?"
Fold asks: "How do I get this project done well?"

They overlap on task management but diverge on everything else.

## What Paperclip does that fold doesn't

### 1. Goal ancestry ("why chain")

Every Paperclip task traces upward: task → parent task → project → goal → parent goal → company goal. Agents always know WHY they're doing something.

```
Research Facebook ads (current task)
  ← Create Facebook ads (parent)
    ← Grow signups by 100 (goal)
      ← Get revenue to $2k/week (goal)
        ← Build #1 AI note-taking app to $1M MRR (company goal)
```

**In fold:** TASKS-DESIGN.md has the mission. Individual tasks have `#needs:tag` for dependencies (what blocks what). But there's no upward "why" chain. A task knows what it needs, but not why it exists in service of the mission.

**Could fold adopt this?** A lightweight version: tasks could link to a goal with a tag like `#goal:growth` or `#for:auth-system`. Not a full ancestry tree — just one link upward. TASKS-DESIGN.md defines the goals, tasks reference them.

### 2. Atomic task checkout (real concurrency control)

Paperclip: `POST /issues/{id}/checkout` — single SQL update, 409 on conflict. No double-work.

Fold: `[@agent-name]` — advisory claim, no enforcement. Two agents could claim the same task.

**Does fold need this?** For 1-3 agents (typical fold use), advisory claims work fine. For 20+ agents (Paperclip's target), you need real locks. This is a scaling boundary — fold could add file-level locking (flock) or a lightweight lock file if it ever needs to scale, but it's not worth the complexity for the common case.

### 3. Budget enforcement & cost tracking

Paperclip tracks token spend per agent, per issue, per project. Monthly budgets with soft warnings (80%) and hard stops (100%). Auto-pauses agents when budget exhausted.

**In fold:** Nothing. No cost awareness at all.

**Should fold add this?** Not as a core feature — fold is file-based and doesn't run agents server-side. But the `fold:mxit:run` skill could suggest tracking cost per task in a comment or resolution bracket: `[x] [done: auth middleware, ~$0.45] Task description`. Lightweight, optional, not enforced.

### 4. Heartbeat model (server-driven execution)

Paperclip: server wakes agents on schedule, agents check in, do work, exit. Server tracks liveness, handles timeouts, manages sessions across heartbeats.

Fold: `fold:mxit:run` is prompt-driven — the agent reads TASKS.md and self-orchestrates. No server, no scheduler, no timeout handling.

**The tradeoff:** Paperclip's model handles crashes and timeouts gracefully (the server knows the agent died). Fold's model is simpler (no server needed) but has no crash recovery beyond manual `mxit recover`.

**Bridge idea:** fold:mxit:run could adopt a "heartbeat pattern" where the agent periodically writes a timestamp to a file. If the timestamp is stale, the next agent knows the previous one crashed. Simple, file-based, no server needed.

### 5. Governance & approval gates

Paperclip: formal approval workflow for governed actions (hiring agents, CEO strategy changes). Board reviews, approves/rejects, decision logged.

Fold: `[?]` status means "needs discussion" but there's no formal approval workflow. Decisions are tracked in TASKS-DESIGN.md but not gated.

**Could fold adopt this?** A `#needs-approval` tag that blocks a task until a human explicitly changes it to `[x] [approved: reason]`. Lightweight — just a tag convention, not a server feature.

### 6. Session persistence across runs

Paperclip: local adapters persist `sessionIdBefore`/`sessionIdAfter` so agents resume context instead of starting from scratch.

Fold: no session management. Each agent invocation starts fresh (though it reads TASKS.md for state).

**Bridge:** TASKS.md and BRIEF/TICKET docs serve as fold's "session persistence" — they capture state that survives across agent sessions. This is already working, just not called "session persistence."

## What fold does that Paperclip doesn't

### 1. Progressive disclosure / markdown-native

Fold: plain markdown files, progressive enhancement (TASKS.md alone for small projects, add MAP/DESIGN/BRIEF/TICKET as needed). Zero infrastructure.

Paperclip: requires a server, database, and UI. Can't work without the control plane running.

**This is fold's killer advantage.** A developer can start with TASKS.md in any project right now. No setup, no server, no account. The format works in any text editor, any git repo, any CI system.

### 2. Investigation & delegation docs (BRIEF, TICKET)

Fold: `.brief/` for investigation docs (boiled-down research), `.ticket/` for delegation briefs (scope, contracts, deviations).

Paperclip: issues have `issueDocuments` with workflow keys (`plan`, `design`, `notes`) but no standard format or convention for investigation vs delegation.

**Fold's approach is richer here.** The BRIEF/TICKET distinction captures two genuinely different needs that Paperclip lumps together as "document attached to issue."

### 3. Discovery & improvement loops (playtest, autorefine)

Fold: `fold:playtest` discovers issues, `fold:autorefine` iterates on quality, `fold` composes them into a loop.

Paperclip: no discovery or improvement methodology. It tracks work but doesn't help you find work or improve quality.

### 4. Rich task semantics

Fold: 7 bracket statuses (`[ ]`, `[@]`, `[x]`, `[~]`, `[?]`, `[!]`, `[*]`), resolution brackets (`[done: what happened]`), execution tags (`#error`, `#stuck`, `#discovered`), due dates, priority by order.

Paperclip: 6 statuses (`backlog`, `todo`, `in_progress`, `in_review`, `done`, `cancelled`, `blocked`). Simpler, server-enforced transitions.

**Fold's format is more expressive** for human-readable task tracking. Paperclip's is more machine-friendly for server enforcement.

### 5. Exploration before commitment (EXPLORE)

Fold: EXPLORE files for speculative brainstorming, separate from committed work.

Paperclip: no concept of pre-commitment exploration. Everything is a task or a goal.

## Design patterns worth stealing

### From Paperclip → Fold

1. **Goal tags on tasks** — `#goal:name` linking tasks to TASKS-DESIGN.md goals. Lightweight why-chain.
2. **Stale heartbeat detection** — agent writes timestamp file, next agent checks freshness. File-based liveness.
3. **Cost annotation** — optional `~$0.XX` in resolution brackets. No enforcement, just visibility.
4. **Approval tag** — `#needs-approval` blocks task until human approves. Convention, not infrastructure.
5. **Request depth tracking** — when delegating, track how deep the delegation chain goes. Prevents infinite delegation loops.

### From Fold → Paperclip

1. **BRIEF docs** — structured investigation format before implementation.
2. **Playtest/autorefine** — discovery and quality loops.
3. **Progressive file types** — not everything needs to be a database record.
4. **Resolution brackets** — rich completion annotations beyond "done."
5. **EXPLORE** — pre-commitment exploration as a first-class concept.

## Architectural takeaway

Paperclip and fold aren't competitors — they operate at different scales:

| Scale | Tool |
|-------|------|
| Solo dev, small project | fold (just TASKS.md) |
| Team project, multiple agents | fold (full TASKS family + BRIEF/TICKET) |
| Multi-project, org-level | Paperclip (control plane + governance) |
| "AI company" with 20+ agents | Paperclip (budgets, org charts, heartbeats) |

The interesting bridge: fold could be the **task execution layer** inside a Paperclip company. Paperclip assigns work to an agent, the agent uses fold:mxit:run to execute it with review gates, BRIEF docs for investigation, and playtest for discovery. Paperclip handles the "who does what and how much does it cost" layer. Fold handles the "how do I do this well" layer.

They compose rather than compete.
