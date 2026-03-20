---
name: fold:playtest:improve
description: Run the analyze-then-fix pipeline — the "discover" facet of fold. One — one agent produces findings as a checklist, another works through fixing them. Self-improvement through playtesting. Use when the user says "analyze and fix", "self-improve", "review and fix", "dogfood this", "find issues and fix them", or wants the analyze→fix pipeline.
---

# Analyze → Fix Pipeline

Two-pass self-improvement: an analysis pass produces findings as a checklist, a fix pass works through them. The system improves itself through its own playtest infrastructure.

## The pattern

```
Pass 1 (Analyze): Read-only review → produce findings as - [ ] checklist
     ↓
Human review: Approve/reject/edit findings before fix pass
     ↓
Pass 2 (Fix): Work through checklist → fix each item → mark [x]
     ↓
Verify: Re-run relevant playtests to confirm fixes work
```

## Pass 1: Analyze

Review the system read-only. Produce findings as mxit checklist items:

```markdown
# Analysis: Code Review

## Architecture

- [ ] `server.ts` mixes routing and business logic — extract handlers #refactor
- [ ] Error responses use 3 different formats across endpoints #consistency
- [ ] No request validation on POST /users — any shape accepted #bug

## Documentation

- [ ] README says "run `npm start`" but package.json uses `deno task serve` #docs
- [ ] API reference missing 4 endpoints added in last month #docs

## Testing

- [ ] No test coverage for the retry logic in queue processor #testing
- [ ] Integration tests mock the database — consider real DB tests #testing
```

### Analysis types

| Type | What to look for |
|------|-----------------|
| **Code review** | Architecture drift, inconsistency, dead code, missing error handling |
| **Doc review** | Outdated instructions, missing sections, broken links |
| **API audit** | Inconsistent response formats, missing validation, unclear errors |
| **DX audit** | Confusing CLI output, poor help text, missing examples |
| **Security scan** | Exposed secrets, missing auth checks, injection vectors |
| **Performance** | Obvious N+1 queries, missing indexes, unbounded lists |

### Rules for findings

- Every finding must be **specific and actionable** — not "improve error handling" but "POST /users returns 500 on duplicate email, should return 409 with message"
- Every finding gets a **tag** for categorization: `#bug`, `#refactor`, `#docs`, `#testing`, `#consistency`, `#security`
- Findings are `- [ ]` items — they become the fix pass's work queue
- Don't fix anything in the analyze pass — just observe and report

### Save findings to a file

Write analysis output to a dedicated file:

```
playtests/
├── analysis-2026-03-15.md    # Findings from this run
├── smoke.md
└── PLAYTEST-RESULTS.md
```

## Human checkpoint

**This is critical.** Between analyze and fix, a human reviews the findings:

- Remove false positives
- Adjust scope (some findings are too big for a quick fix)
- Prioritize (reorder by importance)
- Add context the agent might need for the fix

The human can also add findings the agent missed. The checklist is collaborative.

## Pass 2: Fix

Work through the approved findings checklist. For each `- [ ]` item:

1. Read the finding
2. Implement the fix
3. Run relevant tests
4. Mark `- [x]` with a resolution

```markdown
# Analysis: Code Review (FIXES IN PROGRESS)

## Architecture

- [x] [fixed: extracted to handlers/user.ts, handlers/auth.ts] `server.ts` mixes routing and business logic #refactor — 4m
- [x] [fixed: standardized on {error, message, code} format] Error responses use 3 different formats #consistency — 6m
- [x] [fixed: added zod schema validation] No request validation on POST /users #bug — 3m

## Documentation

- [x] [fixed: updated to `deno task serve`] README says `npm start` #docs — 30s
- [@] API reference missing 4 endpoints #docs

## Testing

- [ ] No test coverage for retry logic #testing
- [~] [deferred: needs design discussion first] Consider real DB tests #testing
```

### Fix rules

- Fix one item at a time
- Run tests after each fix (if tests exist)
- If a fix reveals a new issue, add it as `#discovered` under the current item
- If a fix is too complex for a quick pass, mark `[~] [deferred: reason]`
- Commit after each logical group of fixes

## Verify

After the fix pass, re-run the relevant playtests:

- Did the smoke tests still pass?
- Did the specific issues actually get resolved?
- Did any fixes introduce new problems?

Add results to `PLAYTEST-RESULTS.md`:

```markdown
| 2026-03-15 | Analysis | — | 12 findings: 5 bugs, 4 docs, 3 refactor |
| 2026-03-15 | Fix pass | Partial | 9/12 fixed, 2 deferred, 1 in progress |
| 2026-03-15 | Smoke (re-run) | Pass | All green after fixes |
```

## The recursive loop

Fixes can surface new issues. New issues motivate new playtests. New playtests surface more issues:

```
Analyze → findings → fix → verify → analyze again
     ↑                                    ↓
     └──── new playtest ←── new finding ──┘
```

This is most powerful when the system under test is the tool you're using to test it. If the analyze pass itself is painful, that's a finding. If the fix pass keeps hitting the same infrastructure friction, that's a finding. The system improves by using itself.

## When to run this

- After a major feature lands — "did we break anything? did we miss anything?"
- Periodically — weekly or monthly code health check
- After onboarding a new contributor — "what confused you?"
- When technical debt feels like it's accumulating — let an agent quantify it
- Before a release — confidence check

## Example: Full pipeline

```bash
# 1. Run analysis
# Agent reviews the codebase, produces analysis-2026-03-15.md

# 2. Human reviews findings, removes false positives, reorders

# 3. Run fix pass
# Agent works through the checklist, fixes items, marks [x]

# 4. Verify
# Re-run smoke tests and any affected directed playtests

# 5. Commit
# All fixes committed, results logged
```
