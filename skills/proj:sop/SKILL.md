---
name: proj:sop
description: "Create, register, trial, revise, or retire a project SOP."
disable-model-invocation: true
---

# Project SOP

Use for a repeatable operation that someone must perform reliably. Keep the
procedure in the project that owns the operation. A one-off task, decision, or
test result belongs in tasks, a brief, or a runlog instead.

1. **Locate and define.** Find the project's existing SOP location, index, and
   related procedures before adding a file. Identify the trigger, audience,
   owner, scope, inputs, outputs, prerequisites, and observable completion
   condition. Reuse one canonical procedure rather than creating a second copy.
2. **Write the operation.** Follow the project's format; use `docs:write`'s
   how-to guidance if installed. Give executable steps, verified commands and
   paths, expected checks, and what to do on failure or partial completion.
   Link supporting reference material instead of embedding it all here. Do not
   invent commands or turn a draft into an instruction to run production work.
3. **Make it findable.** Link the SOP from the existing docs index (normally
   `docs/index.md`); if the project has no docs index, use its established
   entry point rather than making a parallel catalog. If agents should follow
   it, add or update one short trigger and link in `AGENTS.md` or the project's
   canonical agent instruction file. Use `agent-instructions:write` if installed
   for that pointer, not for the procedure body. Verify links and trigger wording.
4. **Trial honestly.** When authorized, run one bounded representative case and
   retain a receipt in the project's runlog or existing operations record:
   commands, result, checks, and any recovery used. Mark untested branches and
   platform assumptions explicitly. A document review is not a successful run;
   writing an SOP does not itself authorize execution, release, or deployment.
5. **Maintain and retire.** Keep a stable filename and use the project's version
   history for ordinary revisions; do not bump a manual version for every typo.
   Record consequential behavior or compatibility changes using the project's
   convention, with any migration action. On observed friction, use
   `workflow-review` if installed to choose the smallest correction; otherwise
   review the actual failure. Update the canonical SOP, then check it on the
   next comparable use. To retire one, mark it superseded with the replacement
   (or state that none exists), update the index, agent trigger, and known
   incoming links, and preserve history. Do not silently leave two active
   procedures for the same operation.

At a meaningful checkpoint, reconcile the task and evidence through
`proj:checkpoint`; do not invoke it recursively from a checkpoint. Report the
SOP path, how it is discovered, what was actually trialed, and what remains
untested. Do not claim the lifecycle improves outcomes until real use shows it.
