---
name: fold:11star
description: "Rate and improve a product's UX on the 11-star scale. Use for UX audits, experience ratings, and deciding how to level up a product."
version: 0.1.0
license: MIT
---

# fold:11star — UX Star Rating


## Lookup Cues

Former frontmatter detail, kept here so global lookup stays compact:

> Rate and improve a product's UX on the 11-star scale — from 'it works' (1-star) to 'it's magic' (11-star). Use when the user says 'rate the UX', '11 star', 'star rating', 'how good is the experience', 'UX audit', 'experience rating', 'what star are we at', 'how do we get to N star', or wants to evaluate and level up a product's user experience.

Rate where a product sits on the 11-star scale, then identify the smallest changes to reach the next level. Inspired by Brian Chesky's 11-star framework, adapted for software products used by both humans and AI agents.

## The scale

| Stars | Name | What it means |
|-------|------|---------------|
| 1-3 | **It works** | Core functionality exists. Users can accomplish the task, but it's manual, clunky, or requires documentation |
| 5 | **It's useful** | Organized, reliable, has the features people actually need. Users choose to use it |
| 7 | **It's seamless** | Zero-config where possible. Context flows automatically. Things "just work" without setup or extra steps |
| 9 | **It's invisible** | The tool disappears — users think about their goal, not the tool. Proactive, smart defaults, anticipates needs |
| 11 | **It's magic** | Users forget the tool exists because everything flows. Cross-context continuity, anticipation, genuine intelligence |

## How to use

### Step 1: Assess current state

Read the project's key artifacts — README, CLAUDE.md, TASKS.md, BRIEF docs, user-facing code. Then rate each dimension:

```markdown
## 11-Star Assessment: [project name]

### Current rating: [N] star

### Dimensions

| Dimension | Stars | Evidence |
|-----------|-------|----------|
| **Setup** | ? | How hard is first-time setup? |
| **Core workflow** | ? | How smooth is the main use case? |
| **Error handling** | ? | What happens when things go wrong? |
| **Discovery** | ? | Can users find features without docs? |
| **Context** | ? | Does the tool know what you need? |
| **Cross-session** | ? | Does state persist intelligently? |
| **Multi-user/agent** | ? | Does it work for teams/multi-agent? |

Overall: [weighted average or gut feel — explain which]
```

### Step 2: Identify the gap

For each dimension, describe what the next star level looks like:

```markdown
### Gap: [dimension] — [current] → [target] star

**Current:** What it does now
**Next level:** What [target]-star would look like
**Smallest change:** The minimum work to get there
**Blocked by:** Any dependencies or prerequisites
```

### Step 3: Prioritize

Not all dimensions matter equally. Prioritize by:

1. **User pain** — what frustrates people most?
2. **Effort** — what's cheapest to improve?
3. **Leverage** — what improvement unlocks others?

Output a ranked list of improvements, each as a potential mxit task.

### Step 4: Plan the path

Write a concrete path from current to target star level:

```markdown
## Path: [current] → [target] star

### Must-haves (to claim [target] star)
- [ ] Change 1 — why it matters
- [ ] Change 2 — why it matters

### Nice-to-haves (solidifies the rating)
- [ ] Change 3
- [ ] Change 4

### What NOT to build (belongs at a higher star level)
- Thing X — this is [higher] star territory, premature now
```

## Rules

- **Be honest about the current rating.** "It works" is fine. Most things start at 1-3 star.
- **Stars aren't linear.** Going from 5→7 is harder than 1→5. Going from 7→9 is harder still. Each level requires a qualitative shift, not just more features.
- **Agent UX counts.** If the product is used by AI agents (MCP tools, APIs, CLIs), rate the agent experience separately. A 7-star human UX with a 3-star agent UX is a 3-star product for agent users.
- **The dividing line matters.** Some improvements belong in the product, some belong in the ecosystem around it. Identify which is which — don't build what other tools should handle.
- **Don't over-scope.** The goal is to reach the NEXT star level, not jump to 11. Each fold iteration should target +2 stars max.
- **Evidence over opinion.** Back ratings with concrete examples — "setup requires 4 manual steps" not "setup is hard."

## Integration with fold

11star assessment is a natural input to the fold loop:

1. **fold:11star** rates the current state → produces gap analysis
2. **fold:mxit** turns gaps into tracked tasks
3. **fold:playtest** validates whether changes actually moved the needle
4. **fold:11star** re-rates → did we reach the target?

Run 11star at the start of an iteration (where are we?) and at the end (did we level up?).

## Example: TigerFlare

TigerFlare used this framework to go from 5-star to 7-star:

- **5-star baseline:** Spaces, sync, auth, MCP tools all worked. Useful but required setup.
- **Gap identified:** Auto-sync on start, MCP context on connect, session save skill, cross-project pointers.
- **Path:** Four modular features, each independently installable.
- **Result:** `deno task start` does everything. MCP provides context on connect. Save skill works cross-project. 7-star achieved.

See `BRIEF-11STAR.md` in TigerFlare for the full assessment.
