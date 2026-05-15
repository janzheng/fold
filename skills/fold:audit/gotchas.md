# GOTCHAS.md — durable debug-trap log

Companion to `fold:audit`. Where `TASKS-AUDIT.md` is a one-time sweep, `GOTCHAS.md` is **the persistent residue of debugging** — traps that bit you, written down so the next session (or the next person) doesn't pay the same tax twice.

## What belongs here

If you debug something and the fix takes **longer than 5 minutes to find**, it goes in `GOTCHAS.md`. The trigger is wall-clock cost, not severity. A 30-second confusion isn't worth an entry; a 20-minute "why is this null" hunt is.

Distinguish from sibling artifacts:

| Artifact | Source | Lifecycle |
|---|---|---|
| `TASKS-AUDIT.md` | `fold:audit` — read-only sweep | Findings either get fixed or graduate to `TASKS.md` |
| `PLAYTEST-RESULTS.md` | `fold:playtest` — directed/exploratory runs | Pass/fail log per session, low-noise summary |
| **`GOTCHAS.md`** | Field debugging — whatever bit you in real work | Append-only knowledge base; never deleted |
| `pitfalls.md` | Graduates from `GOTCHAS.md` | Things that bit **≥2 places** — promoted in |

Gotchas are "what bit me." Audit findings are "what *might* bite." Both can produce entries that converge: an audit finding that later actually bites in production gets a gotcha entry referencing the original audit ID.

## Where it lives

Project root: `GOTCHAS.md`. Top-level so it's discoverable next to `README.md` and `TASKS.md` without anyone hunting. For larger projects with subsystem boundaries (an `infrastructure/` dir, a `packages/` tree), nested `GOTCHAS.md` files are fine — but reference the canonical one from the project root so new agents find it first.

## Entry format

Four sections per entry. Tight — one screen scroll max.

```markdown
## N. Short symptom-shaped title

**Symptom.** What the human sees. Paste the actual error message, the
broken behavior, the surprising output. Concrete enough that someone
grepping for their problem will land here.

**Why.** The underlying reason. Not "X is broken" — the mechanism.
"The build artifact is committed and `theme.scss` references partials
another session added," not "the commit had stuff in it."

**Fix.** Copy-pasteable. Code block, exact command, exact patch.
The reader should be able to apply this without re-deriving.

**Reference.** Where it was first hit — file:line, commit SHA, date.
Without this, "fix" rots fast.
```

**Numbering.** Append-only. Never renumber, even when entries get superseded or graduate out. Cross-references (in patches, briefs, journal notes) depend on stable IDs.

**Optional fields** that earn their place once the file grows past ~10 entries:

- **Category** — `#race-condition`, `#layout-trap`, `#packaging`, etc. Enables `grep -B2 "#race"` triage.
- **Severity** — hours-lost / cost-class. "Slow but correct" vs "crash with no warning" vs "data corruption" are different decision triggers.
- **Same family as** — point at related entries so a fix on one prompts checking the others.

For projects with many tools or subsystems, add lookup tables at the top of the file:

```markdown
## Find by tool
| Tool | Entries |
|---|---|
| pharokka | #3, #6, #24, #51 |
| iPHoP | #17-20, #26, #31, #36 |

## Find by topic
| Topic | Entries |
|---|---|
| ARM64 / CUDA | #9, #10, #11, #30, #49 |
| Silent fallbacks | #37, #56, #69, #70 |
```

These pay back when you're triaging a new bite ("is this iPHoP-related?") and grow naturally from the entries themselves.

## Graduation: gotcha → pitfall

A gotcha covers a one-time trap. A **pitfall** is a gotcha that bit **two or more places** in the same project. Pitfalls live in a separate doc (`pitfalls.md`, `PITFALLS.md`, wherever the project keeps deeper traps) and get a higher bar:

- The pattern, not just the instance — abstract the rule, not the symptom
- A diagnosis recipe — how to detect the trap with a console/grep one-liner
- A code-level prevention — lint rule, type, helper that makes the trap unrepresentable

When an entry graduates, **leave a stub in `GOTCHAS.md`**: keep the entry ID and title, replace the body with `Promoted to pitfalls.md §N (bit ≥2 places).` Stubs preserve cross-refs without duplicating the canonical text.

## Never delete, supersede in place

The gotchas file is institutional memory. Old entries — for retired tools, for fixed bugs, for "we don't do it this way anymore" — stay on disk because they tell the next person why a thing they're about to try has already been tried.

When new information overturns or replaces an entry, **append a supersede line at the bottom of the body**:

```markdown
**Superseded by GOTCHA #N (date):** brief reason. See entry N for current guidance.
```

For very large archives, move retired entries to `GOTCHAS-archive.md` next to the canonical file. Never `rm`.

## Relating to other fold artifacts

- **`fold:audit` finds it** → if the finding is a real-world bite (not a theoretical "this could be a race"), file as a gotcha after the audit
- **`fold:playtest` discovers it** → a `confused` or `fail` resolution with a non-obvious root cause earns a gotcha; the playtest entry can reference the gotcha ID
- **`fold:autorefine` surfaces it** → the "what didn't work" section of REFINE.md is a private session log; if a discard reveals a structural trap (not just a bad attempt), promote it to a gotcha
- **`.journal/` entries** → narrative incident postmortems often produce 1-3 gotchas as their durable output; the journal is the *story*, the gotcha is the *rule*

The throughline: **fold's discovery skills produce findings; gotchas keep the ones worth keeping.**

## Worked example

```markdown
## 17. `Deno.watchFs` "No such file" means propagate DELETE, not swallow

**Symptom.** Cross-machine file deletes never propagate. Sync logs
show no error; the file just stays on the other machine.

**Why.** `pushPending` caught `ENOENT` from `pushOne` and returned
silently. The handler treated "file gone" as "skip" instead of
"send DELETE." That silently disabled cross-machine delete
propagation for a year.

**Fix.** If the local file is gone *and* `state.files[remotePath]`
exists, send DELETE. No state → editor tempfile (atomic-save rename
dance); do NOT send DELETE.

```ts
} catch (e) {
  if (e instanceof Deno.errors.NotFound) {
    if (state.files[remotePath]) await sendDelete(remotePath);
    return;
  }
  throw e;
}
```

**Reference.** `src/sync.ts` `pushPending()`, caught while bringing
erko online 2026-04-22. Related: gotcha #18 (Windows `NotFound`
error-text differs).
```

## How to add an entry — the recipe

When debugging just cost you >5 minutes:

1. Open `GOTCHAS.md` in the project root. If it doesn't exist, create it with this header and start at `#1`.
2. Append a new numbered section (next ID after the highest in the file).
3. Lead with **Symptom** — what the human sees, copy-pasted error if there is one.
4. State **Why** — the mechanism, not the symptom.
5. Give a **Fix** that's copy-pasteable.
6. Add **Reference** — file:line + commit SHA + date.

If you hit the same trap again later in a different place, that's the signal to promote: move (or stub) the entry to `pitfalls.md` and rewrite as a pattern.

## Header template for a new file

```markdown
# GOTCHAS

Field-tested debug traps for [project]. Lower bar than `pitfalls.md` —
this captures any non-obvious trap worth a one-time note so the next
agent / future-you doesn't have to rediscover it.

Format: each entry has **Symptom**, **Why**, **Fix**, and **Reference**.
Bar to add: the fix took longer than 5 minutes to find.

Graduation: if the same gotcha bites a second place, promote to
`pitfalls.md` and leave a stub here.

Never delete — supersede in place with `**Superseded by GOTCHA #N:**`
or move to `GOTCHAS-archive.md`. See `fold:audit/gotchas.md` for the
full pattern.

---

## 1. [first entry]
```
