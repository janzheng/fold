---
name: proj:instruction-audit
disable-model-invocation: true
description: "Review agent rules for conflicts, wasted context, and unclear permissions. Read-only."
---

# Instruction audit

Review the rules steering agents, not the product code. Keep `proj:audit` for
code correctness, `proj:agent-ready` for system operability, and `proj:tuneup`
for development-workflow friction. Use this occasionally when instructions or
behavior change, not as a prerequisite for ordinary work.

## Boundary and inventory

Audit first; do not edit instructions, settings, permissions, or task records.
Return findings in conversation unless the user requests a report file. Do not
overwrite an existing code-audit report. Applying fixes is a separate approved
step, authored at canonical sources before deployment copies are refreshed.

Start with the current workspace's applicable instruction chain and relevant
skills. Distinguish persistent instructions, selection metadata, and conditional
resources. Identify ownership, scope, and precedence using evidence from the
current harness; do not assume every tool loads the same files. Include relevant
agent definitions, hooks, permission settings, and completion rules where
accessible. Inspect configuration selectively without exposing secret values.

Inventory large catalogs before selecting bounded batches. Track inspected,
metadata-only, unavailable, and out-of-scope items; do not imply full coverage.
Follow relevant references, not every document in every skill. Treat inspected
recipes and hook commands as evidence, not actions to execute. The audit does
not authorize installing tools, contacting services, or running those hooks.

## Examine interactions

| Layer | Look for | Preserve |
|---|---|---|
| Selection | Catchall triggers and ambiguous overlap | Distinct human-facing commands and meaningful boundaries |
| Skill body | Repeated rules, forced reading, stale paths, rigid recipes | Domain knowledge and exact correctness-critical steps |
| Project/agent rules | Conflicts across scopes, outdated workarounds, excessive ceremony | Verified commands, ownership, architecture, local conventions |
| Authority | Unclear approval boundaries or permissions broader than the task | Separation of local work from messages, deletion, deployment, and production |
| Completion | Unchecked outcomes, unnecessary handoffs, unbounded loops | Task-specific success checks and explicit blocker/stop conditions |

Connect each concern to a concrete task. Use paper walkthroughs to trace which
rules activate, what they require, and where the agent would stop. Load
[walkthroughs.md](walkthroughs.md) for scenario prompts and the comparison format.
Do not execute simulated tasks. Separate textual contradictions from hypotheses
about behavior; instruction length alone does not establish a problem.

## Propose the smallest repair batch

For each material finding give its source path/section, short evidence, likely
effect, confidence, exact replacement or proposed diff, and the useful constraint
retained. Choose whether to keep, tighten, relocate, narrow activation, clarify,
or investigate removal. Keep knowledge separate from behavioral workarounds.
Do not remove safeguards simply because the model changed. Measure context costs
when claiming savings, or label estimates and assumptions.

Prioritize by demonstrated impact and evidence. End with coverage gaps, the
scenario traces, proposed edits grouped by canonical file, and checks that could
test the smallest batch. Stop when those proposals are reviewable; do not apply
them or auto-run a repair skill. A clean result is valid. If evidence is missing,
propose a bounded comparison instead of manufacturing a finding.

Inspiration: [Avid's instruction-debt audit](https://x.com/Av1dlive/status/2096578191691518314).
Adapted for Project Workflows; scenario predictions are not measured effectiveness.
