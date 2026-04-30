# Brainstorm Exercises

Reference for `fold:mxit:explore` Mode 3. Pick one or combine. The agent runs the exercise with the user, then distills the output into mxit format.

## 1. Five Whys

Start with what the user wants to build. Ask "why?" up to five times to find the real motivation:

```
User: "I want to add search"
Why? → "Users can't find their old content"
Why? → "The list view doesn't scale past 50 items"
Why? → "We show everything flat, no hierarchy"
Why? → "We never built categories or folders"
Why? → "The original scope was 'just notes' but now it's a knowledge base"
```

The last answer often reframes the whole project. Maybe you don't need search — you need information architecture.

Output → mission/goals reframing in `TASKS-DESIGN.md`

## 2. Alternate Paths

For any feature or decision, generate 3 approaches with pros/cons:

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

Record all paths in `TASKS-DESIGN.md` Decisions section:

- **Chosen:** `[x] [decided: JWT + refresh] Auth strategy — stateless, works for all clients`
- **Stashed:** `[~] [deferred: Phase 4] Third-party auth — revisit if team shrinks`
- **Killed:** `[~] [rejected: vendor lock-in] Auth0 — evaluated, not worth the dependency`

Deferred paths stash, don't delete. Rejected paths stay too — so you don't re-litigate later.

## 3. Jobs To Be Done (JTBD)

Frame: "When [situation], I want to [motivation], so I can [outcome]."

Ask:
- Who are the users? List 2-3 types.
- For each: what situation triggers them to use this?
- What are they ACTUALLY trying to accomplish? (the outcome, not the feature)
- What do they currently use instead? What's frustrating about it?

Output → Goals and Non-Goals in `TASKS-DESIGN.md`

## 4. Coach Mode

For non-product goals (career, creative projects, life planning), the agent acts as a coach:

- Ask open-ended questions, don't jump to answers
- Reflect back what you hear: "It sounds like you're saying…"
- Challenge assumptions: "What would change if that weren't true?"
- Help prioritize: "Of these 5 goals, which one makes the others easier?"
- The user decides; the agent clarifies. Don't prescribe.

Output → Goals, Non-Goals, Decisions in `TASKS-DESIGN.md` (mxit works for life planning too).

## Examples

### Career exploration

```markdown
# EXPLORE.md

## Path A: Bioinformatics / Lab Science
- [*] Low pay but potentially solve cancer
- [*] Leverages bio background
- [?] Can I get into a good lab at this stage?
- [ ] Research 3 labs doing computational bio

## Path B: Product Design at AI Startup
- [*] AI is hot, design background is strong
- [?] Which startups? Series A vs B?
- [ ] Talk to 2 designers at AI startups

## Path C: AI Design Engineer at Big Co ← leaning here
- [*] Happy medium — good salary + meaningful work
- [@] Exploring this path now
- [ ] Apply to NVIDIA, Apple, Meta AI
```

### Product exploration

```markdown
# EXPLORE-CLI.md

## Approach A: Interactive TUI (blessed/ink)
- [*] Rich UI, progress bars, color
- [~] [rejected: dependency weight] blessed is 2MB, too heavy

## Approach B: Simple flags + JSON output
- [*] Unix philosophy, pipe-friendly
- [@] Prototyping this approach
```
