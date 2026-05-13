<!--
ARCHIVED 2026-04-30 — unregistered from hub via commit f9706c6c
("chore(skills): unregister 10 fold skills (round 1 triage)").
Reason cited in commit: "specialized sub-skill."

Moved into `__active/_apps/fold/skills/_archive/` on 2026-05-13 so it
no longer sits alongside live skills. Content unmodified.

To revive as a standalone skill:
  1. git mv this dir back to `../fold:mxit:tests/` (out of `_archive/`)
  2. Delete this comment block
  3. Copy to `mcp-hub/skills/fold:mxit:tests/` and run `sync-skills.sh`
-->
---
name: fold:mxit:tests
description: Plan, create, and manage test tasks within mxit — brainstorm tests before building, add test gates to phases, run tests and record results, re-run after fixes. TDD-style task planning. Use when the user says "plan tests", "add tests", "test gate", "what should we test", "brainstorm tests", "run tests", "check tests", "fold:mxit:tests", or wants to integrate testing into their TASKS workflow.
---

# fold:mxit:tests — Test-Driven Task Planning

Create and manage test tasks within the mxit system. The core idea: **think about tests first, build second.** Not by enforcing TDD in the runner, but by making test tasks visible in the plan so they can't be forgotten.

For full mxit format reference, see `/fold:mxit`.

## Brainstorming Tests

Before scoping a feature, put yourself in the user's shoes. Ask:

1. **What does the user actually do?** (happy path)
2. **What goes wrong?** (error cases, edge cases)
3. **What's confusing?** (UX, naming, flow)
4. **What breaks under load?** (concurrency, scale)

Turn each answer into a test task:

```markdown
## Search Feature — Tests (brainstorm first)

- [ ] User can search by keyword and get results #test #search
- [ ] Empty search shows helpful message, not error #test #search #edge
- [ ] Search with special characters doesn't crash #test #search #edge
- [ ] Results paginate at 20 items #test #search
- [ ] Search works with 10k+ records in < 500ms #test #search #perf
- [ ] Playtest: use search like a confused new user #playtest #search

## Search Feature — Implementation

- [ ] Search API endpoint #search-api #needs:test-brainstorm
- [ ] Search UI component #search-ui #needs:search-api
```

The brainstorm section comes FIRST. Implementation `#needs` the test thinking to be done.

## Three Patterns

### Pattern 1: Tests alongside features (test-aware)

Tests are peers of the feature. Both must complete before the parent is done.

```markdown
- [ ] Auth system #auth
  - [ ] Auth endpoints #auth-api
  - [ ] Auth endpoint tests #auth-tests #needs:auth-api
  - [ ] Auth playtest: login as new user #auth-playtest #needs:auth-api
```

### Pattern 2: Tests before features (TDD)

Implementation literally blocked until test spec exists:

```markdown
- [ ] Auth endpoint test spec #auth-tests
- [ ] Auth endpoints #auth-api #needs:auth-tests
- [ ] Auth integration test #auth-integration #needs:auth-api
```

### Pattern 3: Phase gates

Tests as exit criteria for a phase. Phase can't be `[shipped]` until gates pass:

```markdown
## Phase 2: Core Product -> 2026-Q2

### Features

- [@] Search API #search-api
- [@] Dashboard #dashboard-ui

### Test Gates (must pass before [shipped])

- [ ] Unit tests: search + dashboard (>80% coverage) #test-gate #needs:search-api #needs:dashboard-ui
- [ ] Playtest: new user onboarding flow #playtest-gate #needs:dashboard-ui
- [ ] Load test: 1000 concurrent searches #perf-gate #needs:search-api
- [ ] Security review: auth + API surface #security-gate #needs:search-api
```

## Recording Test Results

**Critical rule: test results must include verifiable evidence.** A resolution bracket that says "all tests passing" with no artifact, command, or reproduction steps is UNVERIFIED. The agent might be telling you what you want to hear.

Every test resolution MUST include at least one of:
- **Command run** — the exact command, so you can re-run it yourself
- **Artifact produced** — file path to test output, screenshot, log, trace
- **Reproduction steps** — exact steps to verify the result manually

```markdown
# GOOD — verifiable evidence

- [x] [pass: 12/12, `deno test auth/` exit 0] Auth endpoint tests #test
- [x] [pass: screenshot at screenshots/login-flow-2026-03-17.png] Login playtest #playtest
- [x] [pass: 47 tests, results at test-results/search.txt] Search unit tests #test
- [!] [fail: `deno test api/` exit 1, see test-results/api-fail.txt] API tests #test #error="3 failing"

# BAD — unverifiable vibes

- [x] [pass: all tests passing] Auth endpoint tests #test
- [x] [pass: looked good] Login playtest #playtest
- [x] [pass: everything works] Search tests #test
```

If a test task has no evidence, treat it as unverified. Ask: "what command did you run?" or "where's the output?"

### Evidence by project type

The evidence looks different depending on what you're building:

| Project type | Evidence examples |
|-------------|-------------------|
| **UI/Frontend** | Screenshots, browser console logs, Lighthouse scores, visual diff |
| **API/Backend** | Test runner output, response codes, curl commands, timing |
| **CLI tool** | Command + stdout/stderr capture, exit codes |
| **Orchestration/Agent** | Execution traces, state files, event logs |
| **Library** | Test runner output, coverage report path |
| **Playtest** | Findings with exact steps to reproduce, screenshots of issues found |

### Resolution keywords for tests

- `[pass: summary + evidence]` — all tests passing, evidence attached
- `[fail: what failed + evidence]` — tests failing, task stays `[!]` or `[ ]`
- `[partial: N/M passing]` — some passing, work remains
- `[flaky: description]` — passes sometimes, needs investigation
- `[skip: reason]` — intentionally skipped (with reason)
- `[unverified: claim]` — agent reported results but no evidence produced

## Reproduction Steps

Every test — especially playtests — should leave a trail someone can follow:

```markdown
- [x] [pass: login flow works] Login playtest #playtest
  - [*] Steps: 1. Open /login 2. Enter test@example.com / password123 3. Click submit 4. Verify redirect to /dashboard
  - [*] Screenshot: screenshots/login-success-2026-03-17.png
  - [*] Edge case checked: wrong password shows inline error, not redirect

- [!] [fail: signup breaks on step 2] Signup playtest #playtest
  - [*] Steps: 1. Open /signup 2. Fill email + password 3. Click next 4. Phone field rejects valid formats
  - [*] Tried: +1-555-0123, (555) 012-3456, 5550123 — all rejected
  - [*] Screenshot: screenshots/signup-phone-fail.png
  - [*] Reproduce: `open http://localhost:3000/signup` → fill form → step 2
```

The goal: someone reading this in 3 months (human or agent) can reproduce the exact finding without guessing.

## Re-running After Fixes

When a test failed and you fixed the underlying code:

1. Don't mark the test task `[x]` until you re-run
2. Update the resolution bracket with new results:

```markdown
# Before fix
- [!] [fail: timeout on concurrent refresh] Auth race condition test #test #error="3 of 12 failing"

# After fix, re-run passes
- [x] [pass: 12/12 after mutex fix] Auth race condition test #test
```

The resolution bracket tells the story: it failed, we fixed it, now it passes.

## Leaving Notes on Tests

Use `[*]` starred items and sub-items for test notes:

```markdown
- [x] [pass: 47 tests] Search API tests #test
  - [*] Flaky on CI: testPaginationEdge sometimes times out — added retry
  - [*] Coverage gap: no test for Unicode search terms yet
  - [*] Performance: avg 120ms per test, total suite 5.6s
```

Notes stay even after the test passes — they're context for the next person (or agent) who touches this area.

## Adding Tests to an Existing Plan

If a TASKS-MAP.md or TASKS.md exists but has no test tasks, suggest adding them:

1. Read the existing plan
2. For each feature/area, brainstorm: what should we test? what could go wrong?
3. Add test tasks as peers or gates (Pattern 1 or 3)
4. Add playtest tasks for user-facing features
5. Don't go overboard — focus on the risky/complex parts, not 100% coverage of everything

```markdown
## Before (no tests)

- [ ] Search API #search-api
- [ ] Dashboard #dashboard-ui

## After (tests added)

- [ ] Search API #search-api
- [ ] Search tests: keyword, empty, special chars, pagination #search-tests #needs:search-api
- [ ] Dashboard #dashboard-ui
- [ ] Dashboard playtest: first-time user flow #dashboard-playtest #needs:dashboard-ui
```

## When to Use This

- Starting a new phase → brainstorm tests before scoping features
- Reviewing a plan that has no test tasks → suggest adding gates
- A feature shipped with bugs → add regression test tasks
- Preparing to mark a phase `[shipped]` → check that test gates pass
