<!--
ARCHIVED 2026-04-30 — unregistered from hub via commit f9706c6c
("chore(skills): unregister 10 fold skills (round 1 triage)").
Reason cited in commit: "rarely used."

Moved into `__active/_apps/fold/skills/_archive/` on 2026-05-13 so it
no longer sits alongside live skills. Content unmodified.

To revive as a standalone skill:
  1. git mv this dir back to `../fold:ship/` (out of `_archive/`)
  2. Delete this comment block
  3. Copy to `mcp-hub/skills/fold:ship/` and run `sync-skills.sh`
-->
---
name: fold:ship
description: "Pre-ship wrap-up — clean tasks, run tests, fix bugs, playtest (including adversarial), verify, update docs. The 'are we done?' checklist that chains fold skills into a single pass. Use when the user says 'ship it', 'wrap up', 'clean up tasks', 'are we ready to ship', 'pre-ship checklist', 'fold:ship', or wants to finalize an iteration before release."
version: 1.0.0
license: MIT
---

# fold:ship — Pre-Ship Wrap-Up

The "wrap it up" pass. Chains together task cleanup, testing, bug fixing, playtesting, verification, and doc updates into a single ordered workflow. Run this when an iteration feels done but you haven't proven it yet.

## When to use

- End of a feature/sprint/iteration
- Before tagging a release
- When the user says "clean up and ship"
- When you've been building and need to prove it works
- Anytime someone asks "are we done?"

## The checklist

Ship runs six phases in order. Each phase produces mxit-format output. If a phase finds issues, fix them before advancing — don't skip ahead.

### Phase 1: Task Cleanup

Audit TASKS.md and all TASKS-*.md files for hygiene:

```markdown
## Ship: Task Cleanup

- [ ] Read all TASKS*.md files in the project
- [ ] Check off tasks that are done but unmarked (verify in code/git)
- [ ] Add tasks for work done that was never tracked
- [ ] Flag stale tasks — things that no longer apply (`[~] [deferred: no longer relevant]`)
- [ ] Flag stuck tasks — blocked, errored, or abandoned (`[!] [stuck: reason]`)
- [ ] Ensure TASKS-MAP.md reflects current phase status
- [ ] Verify task dependencies (`#needs:`) are accurate
```

Don't just scan — read the code and git log to confirm. A task marked `[ ]` might already be done. A task marked `[x]` might be stale.

### Phase 2: Smoke & Integration Tests

Run existing tests. Add missing ones for new/changed code. Evidence required.

```markdown
## Ship: Tests

- [ ] Run the full test suite — record command + output
- [ ] For each new feature: does a test exist? If not, add one
- [ ] For each bug fix: does a regression test exist? If not, add one
- [ ] Run integration tests (if they exist) — record results
- [ ] Record all results with evidence (see fold:mxit:tests for format)
```

**Evidence is mandatory.** Every test result needs: command run, exit code, output path or inline summary. No `[pass: looks good]` — that's unverified.

### Phase 3: Bug Fixes

Fix what Phase 1 and Phase 2 surfaced. Track as you go.

```markdown
## Ship: Bug Fixes

- [ ] Triage findings from task audit and test run
- [ ] Fix critical issues (test failures, broken features)
- [ ] Fix warnings (stale code, minor issues)
- [ ] Re-run affected tests after each fix — record results
- [ ] Update TASKS*.md with fix resolutions
```

Don't batch fixes then re-test at the end. Fix → re-test → fix → re-test. Each fix gets its own evidence.

### Phase 4: Playtests

Run both smoke and adversarial playtests. Use `fold:playtest:explore` or write directed ones.

```markdown
## Ship: Playtests

- [ ] Smoke playtest: walk through the main user workflow end-to-end
- [ ] Adversarial playtest: try to break it — bad input, edge cases, unexpected sequences
- [ ] Ergonomics check: is the CLI/API/UI intuitive? Confusing errors? Missing help?
- [ ] Record findings as mxit tasks with `[found:]` resolutions
- [ ] Fix critical findings, re-test
- [ ] Add remaining findings to TASKS*.md for next iteration
```

Playtests are judgment-based, not assertion-based. The value is in what surprises you.

### Phase 5: Verify

Run `fold:verify` against specs/design/tasks. This is the gate.

```markdown
## Ship: Verify

- [ ] Run fold:verify against available artifacts (TASKS, SPECS, DESIGN, PROPOSAL)
- [ ] Check completeness — did we do everything?
- [ ] Check correctness — did we do it right?
- [ ] Check coherence — does it fit together?
- [ ] Address any critical findings before proceeding
```

If verify surfaces critical issues, loop back to Phase 3.

### Phase 6: Update Docs

Update user-facing documentation to reflect current state.

```markdown
## Ship: Docs

- [ ] Update README.md — does it reflect what the project does now?
- [ ] Update getting-started / quickstart section — does it still work?
- [ ] Update CLI/API reference if commands/endpoints changed
- [ ] Update CHANGELOG.md — add user-facing changes under `[Unreleased]` (see format below)
- [ ] If tagging a release: move `[Unreleased]` to versioned header with date
- [ ] Run the README instructions yourself — do they work?
```

Docs are the last phase because everything else might change them. Don't update docs then change the code.

### CHANGELOG.md

For public-facing projects (or any project where you want a human-readable history), maintain a `CHANGELOG.md` in the project root. Uses [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Changelog

## [Unreleased]

### Added
- New feature X for doing Y

### Changed
- Updated Z to use new approach

### Fixed
- Bug where A happened when B

### Removed
- Deprecated endpoint /old-thing

## [0.2.0] - 2026-04-06

### Added
- Initial public release
- Core feature A, B, C
```

**Rules for changelog entries:**
- Write for **users**, not developers — "Added dark mode support" not "Refactored ThemeProvider to accept mode prop"
- One line per change, start with a verb (Added, Changed, Fixed, Removed)
- Group under `[Unreleased]` during development, move to a version header at release time
- Only use sections that have entries — skip empty `### Changed` headers
- Link version headers to git diffs if the project is on GitHub: `[0.2.0]: https://github.com/org/repo/compare/v0.1.0...v0.2.0`
- **Don't changelog internal refactors, test additions, or CI changes** unless they affect users

**When to update:** During Phase 6, review the git log since last release and add any user-facing changes to `[Unreleased]`. If shipping a version, move `[Unreleased]` entries under the new version header.

**When to skip:** Internal tools, personal projects, anything without external users. Don't maintain a changelog nobody reads.

## Output: SHIP-REPORT.md

After all phases, produce a summary report:

```markdown
# Ship Report: [project/feature name] — [date]

## Task Cleanup
- Checked off: N tasks
- Added: N new tasks
- Deferred: N stale tasks
- Stuck: N (with reasons)

## Tests
- Suite: N/N passing (`command`)
- Added: N new tests
- Fixed: N failing tests

## Bug Fixes
- Fixed: N issues
- Deferred: N to next iteration

## Playtests
- Smoke: [pass/fail] — summary
- Adversarial: N findings (N fixed, N deferred)
- Ergonomics: N findings

## Verify
- Completeness: N/N pass
- Correctness: N/N pass
- Coherence: N/N pass

## Docs
- Updated: [list of files]
- Verified: README instructions work [yes/no]

## Ship Decision
- [ ] Ready to ship
- [ ] Needs another pass (reason)
```

## Looping back

Ship is not always one pass. Common loops:

- Phase 2 (tests) finds failures → Phase 3 (fix) → back to Phase 2
- Phase 4 (playtest) finds issues → Phase 3 (fix) → back to Phase 4
- Phase 5 (verify) finds gaps → Phase 3 (fix) → back to Phase 5

That's fine. Each loop is a mini-fold. The report tracks cumulative results.

## Graceful degradation

Not every project has every artifact. Ship adapts:

| Available | What ship does |
|-----------|---------------|
| TASKS.md only | Cleanup + tests + playtests + docs |
| TASKS.md + tests | Full pipeline |
| No TASKS.md | Create one from git log, then full pipeline |
| No tests | Add smoke tests, then continue |
| No docs | Flag as a finding, add doc tasks |

## Rules

- **Evidence for everything.** Test results, playtest findings, verify checks — all need proof.
- **Fix before advancing.** Don't skip Phase 3 to get to Phase 4. Ship is sequential for a reason.
- **Don't over-scope.** Ship wraps up *this iteration*. New features go to TASKS.md for next time.
- **Defer, don't ignore.** If something isn't worth fixing now, mark it `[~] [deferred: reason]` — don't pretend it doesn't exist.
- **The report is the artifact.** SHIP-REPORT.md is what proves you shipped responsibly.
- **Human at the gate.** The final "ready to ship" checkbox is for the human, not the agent.
