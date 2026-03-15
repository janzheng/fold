---
name: fold:mxit
description: Set up mxit task tracking in a project — create TASKS.md, use the mxit format for statuses, tags, due dates, and agent coordination. The "track" facet of fold. Use when the user says "set up tasks", "fold:mxit", "add mxit to this project", "track work", or wants markdown-native task management without the full fold loop.
---

# fold:mxit — Task Tracking

The **track** facet of fold. Set up and manage `TASKS.md` files using the mxit format.

For the full format reference, see `/mxit`. For the task runner, see `/mxit:run`. This skill focuses on getting mxit into a project quickly.

## Quick setup

Create a `TASKS.md` in the project root:

```markdown
# Project Name

## Current

- [ ] First task
- [ ] Second task #tag -> 2026-03-31
  - [ ] Sub-task A
  - [ ] Sub-task B
```

Optionally drop `MXIT_SPEC.md` into the project for the full format reference.

## When to use fold:mxit alone

- You want task tracking but don't need playtesting or autorefine
- You're setting up a new project and want structure from the start
- You want agents to be able to pick up work across sessions

## Pairs with

- `/fold:playtest` — discoveries get emitted as mxit tasks with `#found`
- `/fold:autorefine` — too-big issues get emitted as mxit tasks with `#found #autorefine`
- `/fold` — the full loop: discover → track → improve → fold again
