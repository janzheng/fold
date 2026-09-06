---
name: proj:tasks
description: "Manage project tasks in markdown: task it out, add a task, what's next, mark done, dependencies, or a roadmap. Use the existing project task convention; execution can continue through proj:run."
---

# Project tasks

Find the project's task convention and relevant task file before writing. Use
its existing structure; for a new project, a single `TASKS.md` is enough.

- Turn agreed work into concrete, verifiable tasks. Link a brief for substantial
  design context. Keep uncommitted ideas in EXPLORE or conversation.
- Preserve task identities, user edits, dependencies, and existing status syntax.
- In the mxit format: `[ ]` open, `[!]` priority, `[@agent]` claimed, `[x]` done,
  `[~]` deferred. Preserve resolution brackets and explain completed/deferred work.
- Mark done only from evidence. Capture follow-ups without silently expanding
  the current assignment or marking partial work complete.
- Hold `#discovered` work for human scope review and `#needs-approval` work for
  explicit approval; remove each tag only when its gate is satisfied. Approval
  keeps the task open for execution. Gates also hold descendants.
- For requested execution, use `proj:run` or do the scoped task directly, then
  `proj:checkpoint` at the meaningful boundary.

For complex statuses, dependencies, multi-agent coordination, parser/CLI use,
archival, or splitting a growing task family, read the relevant section of
[task-reference.md](task-reference.md). Search its headings first; do not load
the whole reference for a simple checklist edit. Existing mxit CLI names and
file formats remain unchanged by the `proj:` skill rename.

Keep the agreed outcome visible. Surface material scope growth with what can
ship without it and a concrete trigger for revisiting optional work.

Report the changed task file and next ready item briefly.
