---
name: fold:playtest
description: Set up agentic playtesting in a project — discover bugs, loopholes, design flaws, and surprising usage patterns. The "discover" facet of fold. Use when the user says "fold:playtest", "set up playtesting", "add playtests", or wants discovery-focused testing without the full fold loop.
---

# fold:playtest — Discovery

The **discover** facet of fold. Set up and run playtests that find things scripts can't catch.

For writing playtests, see `/playtest`. For running them, see `/playtest:run` (directed) or `/playtest:explore` (open-ended). This skill focuses on getting playtesting into a project quickly.

## Quick setup

Create a `playtests/` directory:

```
project/
├── playtests/
│   ├── boundaries.md         # Edge cases, weird inputs, race conditions
│   ├── fresh-eyes.md         # New user perspective, onboarding friction
│   └── PLAYTEST-RESULTS.md   # History of all runs
├── TASKS.md                  # Big findings get emitted here
└── ...
```

## When to use fold:playtest alone

- You want to discover what's wrong/weird but aren't ready for the full loop
- You're exploring a new codebase and want structured findings
- You want an agent to use the system as a creative user would

## Pairs with

- `/fold:mxit` — big findings get emitted as mxit tasks with `#found`
- `/fold:autorefine` — use findings to guide what to refine
- `/fold` — the full loop: discover → track → improve → fold again
