# AI's Trillion-Dollar Opportunity: Context Graphs

- **Source:** [x.com/JayaGup10/status/2003525933534179480](https://x.com/JayaGup10/status/2003525933534179480)
- **Authors:** Jaya Gupta and Ashu Garg
- **Date:** December 22, 2025
- **Date captured:** 2026-03-15

## Source capture

<source url="https://x.com/JayaGup10/status/2003525933534179480">

The last generation of enterprise software created a trillion-dollar ecosystem by becoming systems of record. The next trillion-dollar platforms will emerge not from adding AI to existing data systems, but from capturing **decision traces** — the reasoning, exceptions, and precedents currently scattered across Slack threads and institutional memory.

### Rules vs Decision Traces

Two types of information agents need:

1. **Rules** — general guidelines ("use official ARR for reporting")
2. **Decision traces** — specific case records showing "we used X definition, under policy v3.2, with a VP exception, because the customer had a multi-year ramp"

Rules live in docs. Decision traces live in people's heads, Slack threads, and email chains. They're the institutional knowledge that makes organizations actually work — and they're almost never captured in any system of record.

### Why agents create the opportunity

Systems-of-agents startups occupy the **orchestration layer** — the execution path where decisions happen. This positioning lets them capture context *at decision time*, unlike:
- Data warehouses (see information post-hoc via ETL)
- Incumbents (store only current state, not reasoning)

As agents automate workflows while recording their reasoning, enterprises gain "a living record of decision traces stitched across entities and time."

### The Context Graph

Accumulated decision traces form **queryable precedent structures**. Not a database of facts — a graph of "what did we decide, why, under what conditions, and what happened next."

This is the new system of record. Not replacing Salesforce or SAP — capturing the layer above them that currently exists only in human brains.

### Three startup paths

1. **Replace entire legacy systems** — build the new system of record from scratch (e.g. Regie in sales engagement)
2. **Replace specific modules** — slot into the incumbent ecosystem, sync back, capture the decision layer
3. **Create entirely new categories** — systems of record for things that never had one (decision lineage, cross-functional context)

### Where to look

"Glue functions" — RevOps, DevOps, Security Ops — roles that exist precisely because no single system captures cross-functional context. These are the seams where decision traces fall through the cracks.

</source>

*Note: X long-form post, captured via Jina proxy.*

## TL;DR

The next big enterprise platforms won't be better databases — they'll be systems that capture *why* decisions were made, not just *what* was decided. AI agents are uniquely positioned to do this because they sit in the execution path where decisions happen. The accumulated decision traces form a "context graph" — a queryable precedent structure that becomes the new system of record.

## Key takeaways

- **Decision traces > data** — the reasoning behind a decision is more valuable than the decision itself. Currently this lives in Slack and people's heads.
- **Agents capture context at decision time** — they're in the execution path, unlike analytics tools that see data after the fact.
- **Context graphs are queryable precedent** — not just "what happened" but "what did we decide, why, and what happened next." This is institutional knowledge made durable.
- **Glue functions signal opportunity** — wherever a human role exists to bridge systems (RevOps, DevOps), there's a context gap an agent could fill.
- **This is the walk-in problem** — persistent, queryable agent memory that accumulates institutional knowledge. See `workshop/walk-in/`.

## Discussion

### 2026-03-15 — First read

The "decision traces" framing is the most interesting part. fold already captures some of this — playtest findings are decision traces ("we found X, decided to fix it, here's what happened"), autorefine iterations are decision traces ("we tried X, it didn't improve quality, we discarded it"). The mxit resolution brackets (`[fixed: rewrote validation logic]`) are literally decision traces.

But fold captures them in flat markdown files. The "context graph" idea is about making these traces queryable and connected — "show me every time we made an exception to policy X" or "what happened last time we tried approach Y?" That's beyond what grep can do on a folder of markdown files.

This connects to the walk-in concept and to nanograph (the on-device graph DB in research). If agent memory were a graph instead of flat files, you could query decision lineage. But the complexity cost might not be worth it for small projects — grep on markdown files is surprisingly powerful.

The "glue functions" insight maps to fold's discovery facet — playtest:explore naturally finds the seams where things fall through the cracks. The difference is fold reports findings; a context graph would *accumulate* them as queryable structure.

### 2026-03-15 — Are graphs overrated? Graphs as derived views

Everyone keeps talking about graphs. Obsidian has graph view (it's the screenshot everyone shares, nobody navigates by it). Neo4j has been around 15 years and is still niche. Knowledge graphs were supposed to be the future in 2015, 2018, 2021. Every time, people end up using Postgres with a join table.

**Nobody stores graph-native. Everyone derives the graph on read:**
- **Git** is flat files. GitHub *derives* the dependency graph, contributor graph, code navigation.
- **Google** crawls flat HTML. PageRank *derives* the link graph.
- **Obsidian** stores flat `.md` files. Graph view is *derived* from `[[wikilinks]]`.

This suggests the right architecture is:

```
Source of truth: flat storage (files, SQLite, whatever)
Derived view: graph when you need it, table when you need it, search index when you need it
```

**For fold:** mxit tasks already have implicit graph edges — `#blocked-by:auth-refactor` is an edge. Playtest findings reference other findings. Autorefine iterations reference artifacts. The graph is already there in the markdown. A `mxit graph TASKS.md` command could derive it on demand without a graph database.

**The recompute cost question:** Full materialization is expensive — GitHub doesn't rebuild the entire dependency graph on every push. They do incremental updates: a commit touches `package.json` → recompute that node's edges, propagate to dependents. Partial recomputation is the key.

For fold-scale projects (dozens of files, not millions), full recompute on every read is probably fine — parse all TASKS.md files, extract edges, build in-memory graph, render. Takes milliseconds. You only need incremental materialization at scale (enterprise, thousands of projects, millions of traces).

**The actual insight from the article isn't about graphs at all.** It's about capturing decision traces — the *why*. You can store those in flat files, SQLite, a graph DB, whatever. The storage format doesn't matter. What matters is that the traces get captured at all. Currently they don't — they live in Slack and people's heads.

fold already captures them (resolution brackets, playtest findings, autorefine logs). The graph is just a view over that data. Store decisions as part of doing the work. Derive whatever graph the view needs — like GitHub derives dependency graphs from flat files. Don't make people build the graph. Build it for them from the work they're already doing.
