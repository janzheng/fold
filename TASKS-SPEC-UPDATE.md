# mxit v1.0 + fold spec update

Upstream underproof extensions into canonical fold. Propagate to all consumers.
Based on research: `github-repos/_workshop/openspec-beads-vs-fold-mxit.md`

## Design notes

- **Single-writer model** — TASKS.md is a single-writer-per-shard "database." Don't add locking, conflict detection, or DB machinery. Sharding (TASKS family, `changes/` dirs) prevents conflicts. Toe-stepping is acceptable and cheaper than prevention. See `fold/research/single-writer-tasks-as-db.md`.
- **Specs are mxit** — Spec scenarios are mxit checkboxes. Same parser, same renderer. No separate spec format needed.
- **changes/ = sharding** — Each change gets its own TASKS.md. One writer per file. Compatible with single-writer model.
- **Execution tags are format, not behavior** — `#run`, `#exec`, `#rerun` are just tags. What happens is the application's business.
- **tid is identity, not concurrency** — `#tid=xxxx` survives editing (line numbers don't). Not a lock.

## Phase 1: Parser & types ~~(fold/src/)~~

- [x] [done: added tid field to Task interface] `types.ts` #code
- [x] [done: extract tid from #tid= tag, both branches] `parse.ts` #code
- [x] [done: export flattenTasks, add #needs:tag blocking] `ready.ts` #code
- [x] [done: fix TAG_RE to handle : separator] `fileops.ts` #code
- [x] [done: export flattenTasks] `mod.ts` #code
- [x] [done: 6 new tests, all 36 pass] tests #test

## Phase 2: MXIT_SPEC.md v0.5 → v1.0

- [x] [done: version bumped, tid section, execution tags, spec linkage, tag separator guidance, changelog added] Update MXIT_SPEC.md #spec #critical

## Phase 3: New skills

- [x] [done: added IMPORTANT block after description] Add no-code constraint to `fold:mxit:brainstorm` #skill #quick
- [x] [done: completeness/correctness/coherence checks, mxit output format] Create `fold:verify/SKILL.md` #skill
- [x] [done: full lifecycle with PROPOSAL/SPECS/DESIGN/TASKS, schemas, archive] Create `fold:mxit:change/SKILL.md` #skill
- [x] [done: delta format, GIVEN/WHEN/THEN as checkboxes, RFC 2119, spec linkage] Create `fold:mxit:spec/SKILL.md` #skill

## Phase 4: Propagate to consumers

- [x] [done: both src/mxit/ and proof-cloudflare/src/mxit/ now re-export from fold, 8 files deleted, TS checks pass, 12/12 tests pass] Underproof: import from canonical fold #refactor
- [x] [done: stale comment added to index.ts] Brigade: mark mxit copy as stale #cleanup
- [x] [done: already compatible, imports parseTasks/getReady/claim/complete/fail/reset — no flattenTasks or tid needed. Pointed import at fold instead of standalone mxit] Expo: verify v1.0 compatibility #verify

## Phase 5: Skill distribution (mcp-hub)

- [x] [done: 3 new + 1 updated copied to mcp-hub/skills/] Sync skills to mcp-hub #sync
- [x] [done: copied Mar 25 version from fold project] Resolve fold:autorefine divergence #sync
- [x] [done: added archived note to README, preserved philosophy content] skills-workshop/fold/ cleanup #cleanup
- [x] [done: added ecosystem pointer at top] Update fold-mxit-expo-stack.md #docs

## Phase 6: Documentation

- [x] [done: ecosystem map, diagram, related projects table] fold README #docs
- [x] [done: ecosystem context section] fold CLAUDE.md #docs
- [x] [done: full spec with directory structure, PROPOSAL/SPECS/DESIGN/TASKS formats, archive, single-writer model] Write CHANGES-SPEC.md #docs
- [x] [done: schema, context, per-artifact rules, how agents use it] fold.yaml context config spec (FOLD-CONFIG-SPEC.md) #docs
