# Claude Code Orchestration Patterns — What Fold Should Steal

*2026-03-31. Based on deep source analysis of Claude Code's leaked internals.*

**Full design doc:** `__resources/github-repos/claude-code-src/notes/fold-upgrade-design.md`
**Full source analysis:** `__resources/github-repos/claude-code-src/notes/` (8 deep dives)

---

## TL;DR — Three patterns that improve every fold skill

### 1. Synthesis step (P0 — the #1 gap)

**Problem:** autorefine, playtest:improve, and mxit:run all forward raw findings to the fixer. This is the anti-pattern Claude Code's coordinator explicitly warns against: "Never write 'based on your findings, implement the fix.'"

**Fix:** After research/analysis, the orchestrator must READ the findings, UNDERSTAND them, and write a SPECIFIC spec with file paths, line numbers, and exact changes. Then dispatch the fixer with that spec.

```
TODAY:    analyze → raw checklist → fix
BETTER:  analyze → SYNTHESIZE (specific specs) → fix
```

### 2. Fresh-eyes verification (P0 for autorefine)

**Problem:** autorefine's judge is the same agent that made the change. It carries implementation assumptions.

**Fix:** Spawn a SEPARATE verification agent with fresh context. Show it ONLY the diff (old vs new). NOT the changer's explanation. Evaluators judge artifacts, not arguments.

### 3. Continue vs spawn (P1)

**Problem:** We always spawn fresh agents. But if the analyzer already loaded the target files, continuing it is cheaper and more accurate.

**Fix:** After synthesis, decide: high context overlap → continue (SendMessage). Low overlap → spawn fresh (Agent).

---

## Per-skill upgrades

### autorefine
- **P0:** Synthesis step in loop (step 2b)
- **P0:** Fresh-eyes judge as separate agent (step 2d)
- **P2:** Parallel research from 3 angles before each change
- Anti-injection: judge sees rubric + diff only, not changer's reasoning

### mxit:run
- **P1:** Read-only research phase before fan-out
- **P1:** Conflict detection (which tasks touch same files → serialize)
- **P2:** Wave-based dispatch (serial per file set, parallel across)
- **P3:** Verification phase after each wave

### playtest:improve
- **P1:** Synthesis between human checkpoint and fix pass
- Turn raw checklist into specific fix specs before dispatching fixer

---

## The anti-injection rule (all evaluators)

Anywhere one agent judges another agent's work: **strip persuasive text, show only artifacts.**

| Evaluator | Show | Exclude |
|-----------|------|---------|
| autorefine judge | Rubric + diff | Why the change is good |
| fold:verify | Code + test results | "I verified and it works" |
| playtest verify | System behavior | Tester's narrative |
| mxit:run review | Task output | Agent's self-assessment |

**Why:** LLMs are persuasive by nature. If the judge reads the changer's explanation, it can be convinced. Strip the argument, show only the evidence.

---

## Key source references

| Deep dive | What we learned |
|-----------|----------------|
| coordinator-multi-agent-deep-dive.md | 4-phase workflow, synthesis, continue vs spawn, concurrency rules |
| memory-dream-deep-dive.md | 4-layer memory, GC/pruning, relevance scoring, session notes |
| compaction-deep-dive.md | 7 compaction strategies, cache economics, layered lightest-first |
| context-lifecycle-thesis.md | Memory + compaction + session notes = one context lifecycle system |
| security-antidistillation-deep-dive.md | YOLO classifier anti-injection (exclude text, judge only actions) |
| swarm-orchestration-for-fold.md | How coordinator/teammate/subagent patterns map to fold skills |

All notes at: `__resources/github-repos/claude-code-src/notes/`
