---
name: fold:mxit:brainstorm
description: Explore and brainstorm before committing to tasks — product discovery, alternate paths, persona play, JTBD, PRD checklists, career/life planning. Saves exploration to EXPLORE.md / EXPLORE-{area}.md, promotes to TASKS family when ready. Use when the user says "brainstorm", "explore ideas", "explore", "what should we build", "zoom out", "think about this", "PRD", "product spec", "jobs to be done", "career goals", "life planning", "coach me", "alternate paths", "fold:mxit:brainstorm", or wants to figure out what to build before building it.
---

# fold:mxit:brainstorm — Explore Before You Commit

The upstream phase. Before anything becomes a task, figure out WHAT to build and WHY. Brainstorming is speculative — most ideas get discarded. That's the point.

The output of brainstorming distills into `TASKS-DESIGN.md` and `TASKS-MAP.md`. The brainstorming itself is ephemeral.

**IMPORTANT: Brainstorm mode is for thinking, not implementing.** You may read files, search code, and investigate the codebase, but you must NEVER write code or implement features. If the user asks you to implement something, remind them to exit brainstorm mode first (e.g., start a change with `fold:mxit:change` or create tasks in TASKS.md). You MAY create EXPLORE-*.md files and BRIEF docs — that's capturing thinking, not implementing.

## When to Use This

- Starting a new project — "what are we even building?"
- Starting a new phase — "what should Phase 3 contain?"
- Stuck on a design decision — "should we use X or Y?"
- Feeling lost — "zoom out, what's the big picture?"
- Non-software goals — career planning, life goals, creative projects

## Exercises

Pick one or combine several. The agent runs the exercise with the user, then distills the output into mxit format.

### 1. Jobs To Be Done (JTBD)

Ask: "When [situation], I want to [motivation], so I can [outcome]."

```
Agent asks:
- Who are the users? List 2-3 types.
- For each: what situation triggers them to use this?
- What are they ACTUALLY trying to accomplish? (not the feature — the outcome)
- What do they currently use instead? What's frustrating about it?
```

Output → Goals and Non-Goals in TASKS-DESIGN.md

### 2. Extreme Users

The agent plays 3 personas and reacts to the product idea:

- **The Power User** — "I want keyboard shortcuts, bulk actions, API access, and I'll hit every edge case"
- **The Confused Newcomer** — "I don't understand what this does. What do I click first? Why is this asking me for a token?"
- **The Adversarial User** — "What if I paste 10MB into this field? What if I open 50 tabs? What if I share a link to something private?"

Each persona generates questions the product needs to answer. Unanswered questions become `[?]` items in TASKS-DESIGN.md.

### 3. Five Whys

Start with what the user wants to build. Ask "why?" five times to find the real motivation:

```
User: "I want to add search"
Why? → "Users can't find their old content"
Why? → "The list view doesn't scale past 50 items"
Why? → "We show everything flat, no hierarchy"
Why? → "We never built categories or folders"
Why? → "The original scope was 'just notes' but now it's a knowledge base"
```

The last answer often reframes the whole project. Maybe you don't need search — you need information architecture.

### 4. Alternate Paths

For any feature or decision, brainstorm 3 approaches:

```
## How should we handle auth?

### Path A: Session-based (Rails default)
- Pros: simple, proven, no client-side token management
- Cons: doesn't work for API-first, mobile clients need cookies

### Path B: JWT + refresh tokens
- Pros: stateless, works for API + mobile + web
- Cons: token revocation is hard, more moving parts

### Path C: Third-party (Auth0/Clerk)
- Pros: zero auth code, social login free
- Cons: vendor lock-in, cost at scale, less control
```

All paths get recorded in TASKS-DESIGN.md Decisions section:

- **Chosen:** `[x] [decided: JWT + refresh] Auth strategy — stateless, works for all clients`
- **Stashed for later:** `[~] [deferred: Phase 4] GraphQL API — good approach but too early, Path B (schema stitching) was best`
- **Killed:** `[~] [rejected: vendor lock-in] Auth0 — evaluated, not worth the dependency`

Deferred paths are stashed, not deleted. When future phases start, check DESIGN for deferred ideas — they might be ready now. Rejected paths stay too, so you don't re-litigate the same decision later.

### 5. Product Spec Checklist (mini PRD)

Walk through these questions. Skip what's not relevant:

```
□ Who is this for? (1-2 sentence user description)
□ What problem does it solve? (the JTBD)
□ What does success look like? (measurable outcome)
□ What's the simplest version that's useful? (MVP scope)
□ What are we NOT building? (explicit non-goals)
□ What decisions need to be made? (open questions)
□ What are the risks? (technical, market, team)
□ What's the rough phase breakdown? (2-4 phases)
□ How will we know it works? (test/playtest plan)
```

Output → directly maps to TASKS-DESIGN.md sections

### 6. Coach Mode

For non-product goals (career, creative projects, life planning), the agent acts as a coach:

- Asks open-ended questions, doesn't jump to answers
- Reflects back what it hears: "It sounds like you're saying..."
- Challenges assumptions: "What would change if that weren't true?"
- Helps prioritize: "Of these 5 goals, which one makes the others easier?"
- Avoids prescribing: the user decides, the agent clarifies

Output → Goals, Non-Goals, and Decisions in TASKS-DESIGN.md (yes, mxit works for life planning too)

## EXPLORE Files — The Sketchbook

When brainstorming produces ideas worth keeping but not committing to, save them in EXPLORE files. These are the sketchbook — same mxit format, but NOT part of the TASKS family. Nothing in EXPLORE is committed work.

```
EXPLORE.md              — general exploration, alternate directions, open questions
EXPLORE-{area}.md       — topic-specific exploration (EXPLORE-UI.md, EXPLORE-CLI.md, etc.)
```

Always UPPERCASE, like the TASKS family.

### Example: career paths

```markdown
# Career Exploration

## Path A: Bioinformatics / Lab Science

- [*] Low pay but potentially solve cancer
- [*] Leverages bio background
- [?] Can I get into a good lab at this stage?
- [?] Grant funding timeline?
- [ ] Research 3 labs doing computational bio

## Path B: Product Design at AI Startup

- [*] AI is hot, design background is strong
- [*] High comp, fast career growth
- [?] Which startups? Series A vs B?
- [ ] Talk to 2 designers at AI startups

## Path C: AI Design Engineer at Big Co ← leaning here

- [*] Happy medium — good salary + meaningful work
- [*] Combines both backgrounds
- [@] Exploring this path now
- [ ] Apply to NVIDIA, Apple, Meta AI
```

### Example: product exploration

```markdown
# EXPLORE-CLI.md

## Approach A: Interactive TUI (blessed/ink)

- [*] Rich UI, progress bars, color
- [?] Too complex for v1?
- [~] [rejected: dependency weight] blessed is 2MB, too heavy

## Approach B: Simple flags + JSON output

- [*] Unix philosophy, pipe-friendly
- [*] Agents parse JSON easily
- [@] Prototyping this approach

## Approach C: Hybrid — simple default, --interactive flag

- [?] Best of both? Or worst of both?
```

### Promoting to TASKS

When you commit to a direction, promote it:

1. The chosen path becomes `TASKS-DESIGN.md` — flesh it out with mission, goals, decisions
2. Unchosen paths stay in `EXPLORE.md` as `[~] [deferred:]` or just leave them
3. Specific items from EXPLORE can be moved to `TASKS.md` or `TASKS-MAP.md`

EXPLORE → TASKS is a one-way promotion. Don't demote committed tasks back to EXPLORE — use `[~] [deferred:]` in TASKS-DESIGN.md instead.

### When EXPLORE leads to BRIEF

Sometimes brainstorming identifies a topic that needs deep investigation before it can become a task. That's a BRIEF doc — see `/fold:mxit` for the full convention. The flow:

1. **EXPLORE** surfaces "we should unify the retrieval layer" (speculative)
2. **BRIEF** investigates how — architecture sketch, interface design, migration plan (conclusive)
3. **TASKS** says "go implement `-> .brief/unified-retrieval.md`" (actionable)

EXPLORE asks "should we?" — BRIEF answers "here's how."

## How Brainstorming Becomes Tasks

Two paths depending on whether you need to save the exploration:

### Path A: Ephemeral brainstorming (most common)

1. **Run the exercise** — agent and user explore in conversation
2. **Distill decisions** → `TASKS-DESIGN.md` (mission, goals, non-goals, decisions, risks)
3. **Distill structure** → `TASKS-MAP.md` (phases, areas, dependencies)
4. **Distill immediate work** → `TASKS.md` (what to start on)
5. **Discard the rest** — conversation served its purpose

### Path B: Persistent exploration (multiple directions, ongoing)

1. **Run the exercise** — agent and user explore
2. **Save to EXPLORE.md** or **EXPLORE-{area}.md** — keep alternate paths alive
3. **When ready to commit** — promote chosen direction to TASKS-DESIGN.md
4. **Keep exploring** — EXPLORE files stay as the sketchbook for future phases

## What NOT to Do

- Don't turn every brainstorm idea into a task — most ideas should die
- Don't put uncommitted exploration in TASKS files — that's what EXPLORE is for
- Don't skip this and jump straight to TASKS-MAP.md — you'll build the wrong thing efficiently
- Don't brainstorm forever — timebox it. 15-30 minutes, then distill or save to EXPLORE
