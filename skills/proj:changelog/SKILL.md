---
name: proj:changelog
description: "Record completed changes and their impact; not plans or releases."
---

# Changelog

Answer: "What changed, and how does that affect someone using or maintaining
this project?" Record completed changes only, including completed but unreleased
work. Completion does not imply release or deployment.

## Scope and evidence

1. Find the project's changelog convention and relevant package/workstream. Keep
   its location, format, language, and release tooling; default to root
   `CHANGELOG.md` only when none exists. For generated logs, edit the canonical
   input for completed changes, not generated history. Honor read-only/draft-only
   requests. Do not create an empty file when nothing qualifies.
2. Bound the review to the requested work or completed checkpoint. Inspect actual
   diffs/results and supporting completed tasks, release metadata, or verification
   records. Trace task completion to its artifacts: a checkbox, plan, commit
   subject, or agent's "done" claim alone is not evidence. Resolve contradictions
   or omit the unsupported claim and report the gap; do not finish work to log it.
3. Include changes to behavior, compatibility, operations, or maintenance that a
   user or maintainer needs to know. Routine formatting, internal cleanup, and
   repetitive bookkeeping need no entry without meaningful impact, even on an
   explicit request. Exclude abandoned, proposed, and incomplete work; a completed
   subset can qualify when its limits are explicit.

## Write the resulting behavior

- Read nearby entries before editing. Consolidate related changes into the
  resulting behavior, not one bullet per commit, task, or agent turn. Update a
  matching Unreleased entry instead of accumulating duplicates; preserve unrelated
  work. Repeating a checkpoint with no new information should produce no edit.
- Lead with observable change and impact, not file lists or implementation diary.
  Use Added / Changed / Fixed / Deprecated / Removed / Security only when useful
  within the existing convention; omit empty categories and task checkboxes.
- State compatibility consequences and explicit migration actions when relevant:
  affected callers/configuration, what stops working, what remains unchanged, and
  the supported replacement or known migration gap. Include a focused check for
  users to verify the migration. Deprecation is not necessarily removal. Never
  imply silent fallback or automatic migration without evidence;
  documenting an action does not authorize performing it.
- Bound claims to what changed and was checked. A partial provider refresh is not
  "all providers are current" or a guarantee of current support. Link relevant
  evidence or coverage records rather than copying test output or inventories.
- Keep secrets and private incident details out, including copied evidence and
  identifying links. Use a safe summary or omit sensitive claims; redaction must
  not repeat the sensitive content.

## Dates, releases, and history

- Default newly completed work to `Unreleased` (or the project's equivalent).
  Distinguish implementation date, release version/date, and deployment state
  when relevant. Use only evidenced values; omit unknown optional fields or label
  important uncertainty. Today's entry date and a commit date are not release dates.
  Local implementation is not production availability; unknown deployment is not
  proof that nothing was deployed.
- Move entries out of Unreleased only with verified release metadata or explicit
  user confirmation/authorization to record that release status. Never invent a
  version/date, promote unfinished work, or treat a planned release as historical.
  Version bumps/tags alone need the project's release convention to interpret them.
- For backfills, identify the inspected evidence/range and its limits in the entry
  or a linked note. If release status is unknown, use a clearly labeled historical
  backfill with unknown release/date, not an invented release or an Unreleased
  assumption. Do not infer a chronology from file mtimes or a squashed snapshot.
- Preserve released history. Correct factual errors with a visible correction or
  erratum next to the affected claim, identifying the old claim, corrected fact,
  evidence, and correction date when known. Do not silently rewrite past behavior
  or present a documentation correction as a new product change. If history leaks
  sensitive material, redact it with a neutral notice, not a verbatim audit trail.

For partial refresh wording, backfills, or errata, read [examples.md](examples.md).

## Boundaries and completion

The changelog owns **what changed and its impact**; journals own why/alternatives,
runlogs own commands/tests/outcomes, tasks own planned/outstanding work, and
reference/inventory docs own current support and verification coverage. Link when
useful; do not duplicate these records. A recent entry proves neither comprehensive
testing nor current support.

`proj:checkpoint` may invoke this skill once for qualifying completed work; do not
invoke checkpoint or other record-writing skills back from here. Finish with the
changed location and a brief summary, or a no-entry reason/evidence gap. Writing
an entry never triggers commits, tags, publishing, deployment, or release creation.
