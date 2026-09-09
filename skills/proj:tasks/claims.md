# Session-owned task claims

Claim before doing tracked work, not only when updating the task afterward.
Planning a task does not claim it. Read-only requests do not authorize task-file
edits; when needed, ask the coordinator to publish the claim instead.
An untracked read-only request needs no new task or claim. For an existing shared
queue assignment, have its coordinator publish ownership before reserving it.

## Identity

Use a stable owner label for this session: tool or known session-name slug plus
a distinguishing session ID suffix, for example `codex-parser-8c00a4ad5aec`.
Use a supplied session/agent identity or an explicitly exposed harness value.
For Codex, inspect CODEX_THREAD_ID/CODEX_SESSION_ID if available; do not assume
every host exposes them. A session ID is not the human-facing chat title.
Do not read other conversations or dump environment variables to find a name.

When no identity is exposed, choose a unique local label once, announce it as
a locally chosen label, and reuse it for this session. Do not claim it is the
app's session name. Keep owner labels single-line and bracket-free; an ASCII
slug with a 12-character ID suffix is convenient. Extend it if a collision appears.
On resume, reuse a known identity; do not adopt an unknown owner's label.

Workers need distinct owner labels. A child may inherit the parent's environment:
use its supplied worker ID or a unique coordinator-assigned label, not the
parent's session ID as if it identified the child.

```markdown
- [@codex-parser-8c00a4ad5aec] Fix parser boundary checks #bug
  <!-- session: parser cleanup; owner label uses the exposed thread ID suffix -->
  <!-- worktree: /project-worktrees/parser-fix -->
  <!-- scope: parser module and focused tests -->
```

Annotations are optional; include only context another worker needs. Do not
publish secrets or private session content. Use the existing task identity and
status syntax, not a second task database.

## Claim and respect ownership

1. Locate the task and read its current status, parent claims, dependencies, and
   approval gates. Claim only ready, agreed work. Another owner's claim is occupied,
   not evidence the work is complete. Choose separate work or coordinate a handoff.
2. Write `[@session-owner]` to the specific task, preserving unrelated content.
   Re-read to confirm the task identity and owner before working. Re-check before
   status changes; never apply a remembered line number to a changed file blindly.
3. Claim only the portion being worked on. For a shared parent, the coordinator
   can retain the parent claim while explicitly assigning child tasks to distinct
   workers. A foreign parent claim is not permission to take its children.
4. Mark only owned work done, after verification. For a pause/block, retain the
   owner and add a concise state note. Release to open with a reason when stopping
   and no worker remains active, or transfer after an agreed handoff. Never reset
   an unfamiliar claim because it looks old; timestamps alone do not prove a crash.

## Worktrees and safety limits

Use the project's agreed shared TASKS path or have the coordinator publish claims
there. Different worktree copies are not a shared queue: an uncommitted claim in
one is invisible in another. If no common record is established, say so and agree
the location before treating local claims as project-wide reservations. Do not
silently edit an unrelated checkout or force commits/merges to announce ownership.

Claims are advisory, not atomic locks. Use a single queue writer/coordinator or
an existing locking service for simultaneous claim attempts; re-reading alone
cannot prevent races. The bundled CLI's claim/done/fail operations have no owner
guard or atomic locking. Its recover (and run's recovery step) clears ALL claims
without checking liveness. Do not use blanket recovery on a shared queue; reconcile
individual owners using confirmed terminal state or explicit handoff authorization.
