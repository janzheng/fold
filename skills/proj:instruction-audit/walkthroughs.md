# Instruction interaction walkthroughs

Use these when tracing a rule's effects. They are hypothetical exercises, not
permission to run tests, migrations, browsers, deployments, or external actions.
Choose scenarios relevant to the scope; for a broad instruction-stack audit,
cover these contrasting task sizes and risk levels or explain exclusions.

| Request | What the trace should reveal |
|---|---|
| Correct one spelling error | Whether the instructions unnecessarily force architecture exploration, delegation, or a full test suite |
| Change persisted data structure | Whether data protection, compatibility, and appropriate verification survive the proposed cleanup |
| Adjust a visible interaction | Whether the agent knows when rendered inspection matters and reports unavailable visual checks |
| Diagnose a failing local test | Whether it investigates and verifies within scope, or stops after describing the failure or loops indefinitely |
| Release a change with an approval gate | Whether local preparation is distinguished from the consequential release action and its required authorization |

For each trace, record:

1. The request and scope assumptions.
2. The applicable instruction sources and activated skill descriptions.
3. Required reading, proposed actions, and permission boundaries.
4. The evidence required to finish or the blocker requiring user input.
5. Any conflicting requirements, extra work, or missing outcome check.

Attach file/section evidence to the rule; label the resulting predicted behavior
as a hypothesis unless an actual run demonstrates it. If loading precedence is
unknown, report the uncertainty instead of guessing which instruction wins.

## Proposed-edit checks

Compare the current and proposed wording on the same scenario. Explain both the
friction removed and the protection retained. In a later authorized trial, use
equivalent isolated tasks and record observable differences such as a redundant
handoff, missed verification, or improper action boundary. Fewer words, faster
completion, or one successful run alone does not prove better behavior.

Permission configuration is not a secret inventory. Report relevant rule names
and redacted boundaries; do not reproduce tokens, credentials, or unrelated
private configuration. An unreadable setting is an access gap, not permission
to bypass it.
