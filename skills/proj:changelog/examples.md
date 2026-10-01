# Changelog examples

Illustrative evidence and wording, not a report on a repository's current state.
Use actual project names, evidence links, versions, and dates only after inspection.

## Coverflow: partial provider refresh

Given inspected local diffs implementing new API functions, explicit rejection
of deprecated model IDs, unchanged workflow pins, and a verification record that
covers only the touched integrations:

```markdown
## Unreleased

### Added
- New API functions are available in the local implementation for the reviewed
  integrations. This entry does not establish release or deployment status.

### Changed
- Deprecated model IDs now fail explicitly; no replacement model is selected.
  Existing workflow pins remain unchanged. Before running an affected
  workflow, explicitly choose a supported replacement, update its pin, and verify
  its inputs and outputs; no automatic migration is performed.

Scope: only the named integrations in the linked refresh record were reviewed;
other integrations were not assessed. This is not a full provider freshness or
support inventory.
```

In a real entry, name the implemented functions and affected IDs from the diff,
and link the existing refresh/coverage record. If a replacement is not established,
say so instead of guessing one. Describe only the observed before/after behavior;
do not assume an earlier silent fallback unless the evidence shows it.

## Historical backfill

With only a snapshot and a passing export fixture, no recoverable release metadata:

```markdown
## Historical backfill (release and implementation dates unknown)

- CSV exports include a header row. Confirmed in the inspected snapshot and export
  fixture; the introduction version, release date, and deployment state could not
  be established. Evidence: link to the snapshot and fixture record.
```

This documents an evidenced historical capability, not a newly released feature
or a reconstructed release sequence. A capture date may be labeled separately.

## Released-entry correction

Keep the released heading and visibly mark the affected claim, for example:

```markdown
- Retries all failed requests. **Correction (date of this correction):** the
  original claim was too broad; this release retries only HTTP 429 responses,
  not other failures. Evidence: link to this release's retry policy and tests.
```

Use the real correction date if known. If retry behavior changed in a later
release, document that separately; it is not an erratum about the earlier release.
