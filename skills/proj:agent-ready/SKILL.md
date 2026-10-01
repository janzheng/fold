---
name: proj:agent-ready
disable-model-invocation: true
description: "Review or refactor architecture and interfaces for reliable agent use."
---

# Agent-ready project

Make the system easier for an agent to understand, operate, and modify correctly.
Examine the project itself: architecture, interfaces, state, feedback, and recovery.
Use `proj:tuneup` for the working process: setup, instructions, task routing,
verification routines, and handoffs. Shared techniques do not make these the same
pass; keep the requested outcome in focus.

## Establish the operating scope

Read the project map, relevant instructions, tasks, and lessons. Identify the
intended agent role and operations: using a service, maintaining code, running
experiments, or another concrete job. Keep the product purpose and agreed launch
scope fixed. If the role would materially change the refactor, clarify it first.

For a bare invocation, assess and recommend first. When asked to clean up, make
agent-ready, or refactor, implement bounded improvements after establishing the
gaps. An explicitly read-only review stays read-only. For an unbuilt system,
review the design and label assumptions; revise the plan only when requested.

## Inspect the system from the agent's side

Trace representative operations through their actual code and interfaces,
including relevant failure paths. A prior incident is not required: this can be
a proactive readiness pass. Ground each gap in inspected behavior or a concrete
design scenario, distinguishing evidence from untested hypotheses.

- Understand: are responsibilities, authoritative state, and entry points clear?
  Can an agent locate and change the responsible module without guessing across
  duplicated logic or inconsistent contracts?
- Observe: can it inspect current state, constraints, and progress without
  reconstructing them from scattered output?
- Act: are inputs and effects predictable, with validation and bounded controls?
  Prefer established APIs, CLIs, or tools over fragile implicit interactions.
- Verify: are success, partial completion, and failure distinguishable? Can it
  connect a result to the operation and check the outcome at the relevant boundary?
- Recover: are errors actionable? Can it resume or retry without duplicating
  effects, losing evidence, or exceeding the original permissions?

## Refactor and verify

Rank gaps by their effect on intended operations. Prefer clarifying or simplifying
existing boundaries, consistent contracts, inspectable state, and useful errors
over a new framework. Documentation can expose an interface; it cannot substitute
for missing controls or observability. Add an abstraction only for a demonstrated
problem, not for theoretical coherence or agent convenience.

Implement within the agreed scope and preserve human usability, compatibility,
permissions, and protective checks. Large redesigns or new external actions need
separate agreement. Reproduce a gap or establish a concrete check, make the change,
then replay the affected operation and relevant failure path in a safe test
environment. Do not run destructive or production operations merely to evaluate
readiness. State inaccessible or untested boundaries explicitly.

Report the operating scenario, evidence, changes or recommendations, verification,
and remaining limits. For implementation work, update the existing TASKS record
and retain reusable failures in the existing lesson ledger; read-only reviews
do not edit records. Separate optional follow-ups from launch blockers; a no-change
result is valid. Stop when checks for the scoped gaps pass, including the relevant
failure paths, not merely when pre-existing tests pass or the project looks cleaner.

Inspiration: https://x.com/doodlestein/status/2094288037458882668
Bounded adaptation; no claim of empirically measured effectiveness.
