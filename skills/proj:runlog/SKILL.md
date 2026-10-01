---
name: proj:runlog
description: "Record tests, experiments, or operations with outcomes and evidence."
---

# Run log

Use the project's existing run ledger. Otherwise use `RUNLOG.md` at the relevant
project/workstream root. Do not put an attempt in a shared cross-project log.

Read recent entries and preserve their format. Record one concise entry containing:
- Date and stable run identity or name.
- Command/configuration and input/revision/environment needed to interpret it.
- Result: pass, fail, blocked, or incomplete; include measured values and duration
  only when observed. Unknown is preferable to invented precision.
- Key finding and links to outputs/logs. Keep raw bulk output in its existing file.

A simple table is enough: Date | Run | Result | Duration | Evidence / finding.
Add a short linked detail file only when reproduction needs more space.
For comparisons, identify the baseline and material differences in conditions.
An exit code alone does not establish correctness; record what was verified.
A negative result (no hits, nothing changed, all clean) names what was searched
or checked and what was skipped.

Log successes as well as failures. Update an in-flight entry when that same run
finishes; append a distinct retry. Preserve earlier failed attempts. Check for an
existing run ID before appending to avoid duplicate records at checkpoint.

Reasoning about alternatives belongs in `proj:journal`; a reusable trap belongs
in `proj:lessons`. Link those records only when there is a real lesson to retain.
Return the log location and result briefly. Logging does not authorize rerunning
an expensive experiment or starting new work.
