# Agent-operability review

Load only for an explicit agent-operability review, or when operating this system
through agents is central to the agreed design. Keep the launch outcome fixed.

This is the lightweight planning/review lens. For a dedicated existing-project
readiness pass or agent-ready cleanup/refactor, use `proj:agent-ready`. For
development-process friction, use `proj:tuneup`. A review request remains read-only.

Walk one concrete intended operation:
1. Discover: can the agent find the entry point and authoritative instructions?
2. Observe: can it determine current state and relevant constraints?
3. Act: is the intended operation clear and bounded?
4. Verify: can it distinguish success, partial completion, and failure?
5. Recover: can it diagnose a failure and safely resume or retry where appropriate?

Report demonstrated gaps with evidence, impact, and the smallest useful change.
Separate launch blockers from optional improvements. Prefer existing interfaces,
clear feedback, and removing steps before adding abstractions or frameworks.
Do not optimize agent convenience at the expense of human users or correctness.
Review is read-only unless changes to the plan or implementation are requested.

Inspiration: https://x.com/doodlestein/status/2094288037458882668
This is a bounded adaptation, not an empirically validated prompt.
