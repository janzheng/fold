<!-- Standalone mxit spec — drop this file into any project that uses TASKS.md -->
<!-- Canonical source: https://github.com/janzheng/mxit -->

# mxit Specification

**Version 0.4**

mxit is a markdown-native plain-text format for tasks, checklists, and agent orchestration, based on [xit!](https://xit.jotaen.net/) v1.1.

The name is "markdown + xit" — pronounced like "mix it".

## License

Per Creative Commons CC0 1.0 Universal, to the extent possible under law, the authors have waived all copyright and related or neighbouring rights to this work.

## Preface

The keywords "MUST", "MUST NOT", "SHOULD", "SHOULD NOT", and "MAY" in this document are to be interpreted as described in RFC 2119.

mxit extends xit! for use in markdown files. The key differences from xit! are:

- Items use markdown bullet syntax (`- [x]` instead of `[x]`)
- Sub-items are supported via nested bullets
- Titles use markdown headings (`##`)
- Importance is a checkbox status (`[!]`) rather than a separate priority field
- A starred status (`[*]`) is added for special notes
- Execution state (error, blocked, stuck) uses tags, not status brackets
- Resolution annotations use bracket format (`[keyword: message]`)
- Multi-agent claiming via `[@agent-name]`
- File format is `.md` (typically `TASKS.md`)

## File Format

The file name SHOULD be `TASKS.md`.

The file encoding MUST be UTF-8.

Newlines MUST be encoded with either `\n` or `\r\n`.
The newline style SHOULD be consistent within a file.

There SHOULD be a newline at the end of the file.

### Item

An *item* is an entry in the file.

It MUST start with `- ` (hyphen, space) followed by a *checkbox*.
There MAY follow a *resolution annotation* and/or a *description* after the checkbox.

*Checkbox*, *resolution annotation*, and *description* MUST be separated by one space character (` `).

The *item* MUST NOT contain any blank lines within its body (excluding sub-items).

An *item* MAY contain *sub-items* (see Sub-items).

An *item* MAY be followed by *annotations* as HTML comments (see Annotations).

### Checkbox

A *checkbox* represents the *status* of the *item*.

It MUST be a sequence of characters enclosed in square brackets (`[` and `]`).

The character(s) between the brackets determine the *status* of the *item*.
The status MUST be one of:

| Syntax | Status | Meaning | Actionable |
|--------|--------|---------|------------|
| `[ ]` | open | Not yet started | Yes |
| `[@]` | ongoing | Currently in progress | No (in progress) |
| `[x]` | done | Completed | No |
| `[~]` | obsolete | No longer relevant | No |
| `[?]` | in question | Uncertain, needs discussion | No |
| `[!]` | important | Needs attention | Yes (prioritize over `[ ]`) |
| `[*]` | starred | Special note, flagged | No (informational) |

**Critical:** `[!]` means **important / needs attention**, NOT error. Error state is expressed via tags (see Execution State Tags).

The *ongoing* status MAY include an agent name: `[@agent-name]`. This indicates which agent has claimed the task (see Multi-Agent Claiming).

The regex for matching an item line is: `^(\s*)- \[([ x~@!?*])\]\s+(.+)$`

For items with an agent name: `^(\s*)- \[@(\w[\w-]*)\]\s+(.+)$`

> #### Example
>
> ```markdown
> - [ ] This is an open item
> - [x] This is a done item
> - [@] This is an ongoing item
> - [@claude-1] This is claimed by claude-1
> - [~] This is an obsolete item
> - [?] This is an item in question
> - [!] This is important
> - [*] Special note to self
> ```

### Description

The *description* is user-provided text that gives meaning to the *item*.

It MUST start on the same line as the *checkbox* (or *resolution annotation* if present).

The *description* MAY contain any number of *tags*, and/or one *due date*.
(Any additional *due dates* MUST be disregarded.)

> #### Example
>
> ```markdown
> - [ ] This is a simple description
> - [ ] This has a #tag and a due date -> 2026-03-31
> ```

### Resolution Annotation

A *resolution annotation* is an optional bracket after the checkbox that describes what happened when the task was completed or closed.

It MUST be enclosed in square brackets and contain a keyword followed by a colon and a short message: `[keyword: message]`.

The *resolution annotation* MUST appear between the *checkbox* and the *description*.

Recommended keywords: `fixed`, `done`, `wontfix`, `deferred`, `needs`, `blocked`, `decided`, `reversed`, `resolved`, or any short verb.

> #### Example
>
> ```markdown
> - [x] [fixed: rewrote validation logic] Input validation was broken #bug
> - [x] [done: added 3 test cases] Write edge case tests
> - [~] [deferred: moving to Q3] OAuth PKCE support
> - [?] [needs: design review] Should we support token rotation?
> ```

### Timestamp

An optional *timestamp* MAY appear at the end of an item's line, enclosed in square brackets.

It SHOULD use ISO 8601 date format: `[yyyy-mm-dd]`.

> #### Example
>
> ```markdown
> - [x] [done: shipped] Deploy the new API [2026-03-14]
> ```

### Sub-items

An *item* MAY contain *sub-items*, which are themselves *items* nested underneath a parent.

A *sub-item* MUST be indented by 2 space characters relative to its parent.

Sub-item nesting depth is unlimited.

Each *sub-item* follows all the same rules as a top-level *item*.

> #### Example
>
> ```markdown
> - [ ] Build the thing
>   - [x] Design the API
>   - [@] Write the code
>     - [x] Set up project
>     - [ ] Implement core logic
>     - [ ] Write tests
>   - [ ] Deploy
> ```

### Due Date

A *due date* determines how timely an *item* is.

It MUST be commenced with the character sequence `-> `
(a hyphen, a greater-than sign, and a space),
and then followed by a date pattern.

The date pattern MUST be either of:

- `yyyy-mm-dd` or `yyyy/mm/dd` to reference a calendar day
- `yyyy-mm` or `yyyy/mm` to reference a month period
- `yyyy` to reference a year period
- `yyyy-Www` or `yyyy/Www` to reference a week period
- `yyyy-Qq` or `yyyy/Qq` to reference a quarter period

`y` MUST be a digit that denotes the year;
`m` the month;
`d` the day;
`w` the week number (according to ISO 8601);
`q` the quarter number.
`W` and `Q` MUST appear literally.

The periodic patterns MUST be treated as equivalent
to the last calendar day within the respective time frame.

The *due date* value MUST be representable by the Gregorian calendar.

> #### Example
>
> ```markdown
> - [ ] Ship by end of March -> 2026-03-31
> - [ ] -> 2026-Q2 Finish this quarter
> - [ ] Some time this year -> 2026
> ```

### Tag

*Tags* are annotations for categorising or filtering items.

A *tag* MUST consist of a *tag name*,
which MUST be preceded by a single `#` character.
The *tag name* MAY be followed by a `=` character and a *tag value*.

The *tag name* MUST only contain letters, digits, or the characters `_` or `-`.
It MUST be treated as case-insensitive.

The *tag value* MAY be surrounded by a pair of matching quotes,
which MUST either be `"` (recommended) or `'`.
- If the *tag value* is quoted, it MAY contain any character
  except for the respective quote character itself, or a newline.
- If the *tag value* is not quoted, it MUST only contain
  letters, digits, or the characters `_` or `-`.

An empty *tag value* (e.g. `#tag=` or `#tag=""`)
MUST be treated the same as an absent *tag value* (e.g. `#tag`).

The *tag value* MUST be treated as case-sensitive.

The *tag name* MAY use a colon (`:`) as a separator for namespaced tags (e.g. `#blocked-by:auth-refactor`). The colon is part of the tag name for parsing purposes, but consumers MAY interpret it as a namespace separator.

> #### Example
>
> ```markdown
> - [ ] This item has a #tag
> - [ ] This #item has #multiple #tags
> - [ ] Tags can #have=values
> - [ ] Values #can="be quoted"
> - [ ] Blocked #blocked-by:auth-refactor
> ```

### Execution State Tags

Execution state — error, retry, blocked, stuck — is expressed via *tags*, not status brackets. This allows a task to be both `[!]` important AND `#error` at the same time.

The following tags have special meaning:

| Tag | Meaning |
|-----|---------|
| `#error` | Task failed on last attempt, eligible for retry |
| `#error=N` | Task has failed N times (runner increments this) |
| `#error="message"` | Error detail from last failure |
| `#stuck` | Runner gave up after MAX_RETRIES, needs human intervention |
| `#blocked-by:tag` | Blocked until no open task has that tag |
| `#needs:tag` | Blocked until the item with that `#tag` is `[x]` (architecture dependencies) |
| `#discovered` | Task was found during execution of parent task |

`#needs:tag` and `#blocked-by:tag` have the same blocking semantics but different intent: `#blocked-by` is for task-level blocking within a file, while `#needs` is for architecture-level dependencies (typically in TASKS-MAP.md) where features depend on other features being shipped. Both prevent the item from being **ready**.

Execution state tags are typically written by a runner or agent, not by humans, though humans MAY add or remove them. `#needs` tags are typically written by humans when laying out architecture.

> #### Example
>
> ```markdown
> - [ ] Fix the race condition #error="timeout after 30s"
> - [!] Critical security patch #error=3 #stuck
> - [ ] Deploy new endpoint #blocked-by:auth-refactor
> - [ ] Dashboard #dashboard #needs:search-api #needs:design-system
> ```

### Annotations

*Annotations* are HTML comments that appear on indented lines immediately after an *item*. They provide metadata for runners and agents.

An *annotation* MUST be an HTML comment (`<!-- key: value -->`) indented under its parent item.

Recognized annotation keys:

| Key | Meaning |
|-----|---------|
| `test` | Command to run to verify the task |
| `accept` | Acceptance criteria |
| `timeout` | Maximum time for agent execution |
| `budget` | Maximum cost for agent execution |

> #### Example
>
> ```markdown
> - [ ] Add input validation #feature
>   <!-- test: deno test api_test.ts -->
>   <!-- accept: all edge cases handled -->
>   <!-- timeout: 5m -->
>   <!-- budget: $0.50 -->
> ```

### Group

A *group* is any consecutive number of *items*
(without blank lines in between),
that MAY be preceded by one *title*.

Groups SHOULD be separated from each other by one or more blank lines.

> #### Example
>
> ```markdown
> - [ ] This item and the next one ...
> - [ ] ... are grouped
>
> - [ ] This item is its own group
> ```

### Title

A *title* MUST be a markdown heading (lines starting with one or more `#` characters followed by a space).

Any heading level (`#`, `##`, `###`, etc.) is valid.

There MAY be a blank line between the *title* and the first *item* in the group.

> #### Example
>
> ```markdown
> ## Shopping
>
> - [ ] Milk
> - [ ] Eggs
>
> ## Work
>
> - [@] Finish the report
> - [ ] Email the team
> ```

### References Section

A file MAY include a `## References` section linking to other task files or relevant documents. Agents and humans follow these links for cross-file context.

> #### Example
>
> ```markdown
> ## References
>
> - Backend: `backend/TASKS.md`
> - Types: `packages/types/TASKS.md`
> - Design doc: `design/auth-redesign.md`
> ```

## Team Declaration

A project MAY declare available team members — humans and agents — in `TASKS-DESIGN.md` under a `## Team` section:

```markdown
## Team

- [*] @yawnxyz — human, product/design, final decisions, external tasks
- [*] @claude — AI agent, Claude Code, primary dev + planning
- [*] @codex — AI agent, Codex CLI, parallel coding tasks
```

The `@name` is what goes in `[@name]` when claiming tasks. Not everyone needs to be listed — add as needed. Human tasks (e.g. "sign up for Stripe API", "talk to legal") SHOULD be assigned to the human team member.

## Multi-Agent Claiming

When multiple agents work on the same file, an agent claims a task by writing its name in the bracket:

```markdown
- [@claude-1] Refactor the auth module
- [@codex-2] Fix the parser bug
- [ ] Write tests (unclaimed)
```

No locking is required for 1-3 agents. Claims are advisory ("I'm here"), not locks. For higher concurrency, the runner SHOULD assign tasks (serial dispatch prevents races) or the file SHOULD be split by area.

If two agents race on the same task, last write wins. The loser re-reads the file and picks a different task.

### Agent Nicknames

When fanning out subagents, each MAY pick a memorable `adjective-animal` name for easy identification:

```markdown
- [@bold-otter] Search API integration #search-api
- [@calm-fox] Background job queue #bg-jobs
- [@dry-hawk] CDN setup #cdn
```

Agent nicknames are **ephemeral** — useful while agents are live, replaced by the resolution bracket when done:

```markdown
- [x] [done: Typesense integrated, 12 tests] Search API integration #search-api
```

The agent name disappears because it served its purpose. What matters after completion is what happened, not who did it.

## Discovery

When an agent discovers new work during execution, it MUST nest the discovery under the current task with the `#discovered` tag:

```markdown
- [@claude-1] Fix the auth bug
  - [ ] Rate limiter doesn't count refresh tokens #discovered
  - [ ] Token expiry edge case on DST change #discovered
```

Discovered tasks MUST NOT be automatically dispatched. They wait for human review or explicit user action.

## Ready Semantics

A task is **ready** (actionable) when ALL of the following are true:

- Status is `[ ]` or `[!]`
- AND no children are in `[ ]`, `[@]`, or `[!]` status (subtasks must finish first)
- AND no `#blocked-by:tag` where that tag exists on an open task
- AND no `#needs:tag` where that tag exists on a non-`[x]` item
- AND no `#stuck` tag

## Priority

Priority is determined by **bullet order** — the first item in a group is highest priority. `[!]` items SHOULD be prioritized over `[ ]` items in the same group.

No numeric priority system (e.g. `#p0`, `#p1`) is part of the spec, though users MAY add such tags for their own use.

## Archival

`TASKS.md` is working memory — it SHOULD stay short. Completed and obsolete items SHOULD be archived when they accumulate.

**Archive files:** `TASKS.done.md` for the fridge list, `TASKS-{area}.done.md` for area files. Always UPPERCASE: `TASKS-UI.done.md`, never `tasks-ui.done.md`.

**Alternatively:** a `## Archive` section at the bottom of the same file (simpler but file grows).

Archive files SHOULD be append-only, with newest entries at the top. Resolution brackets and timestamps MUST be preserved when moving items.

**What gets archived:**
- `[x]` done items and `[~]` obsolete items from TASKS.md and area files
- NOT shipped phases in TASKS-MAP.md — completed phases with `[shipped DATE]` stay in the map as the shipping record
- NOT decided/resolved items in TASKS-DESIGN.md — those are reference, not tasks

**When to suggest archiving:**
- Runners and agents SHOULD suggest archiving when 5+ completed items accumulate in TASKS.md or 10+ in area files
- Archival MUST be user-driven — runners and agents MUST NOT auto-archive

> #### Example
>
> ```markdown
> <!-- TASKS.done.md -->
> # Archived Tasks
>
> ## 2026-03-16
>
> - [x] [done: extracted to auth/validation.ts] Extract token validation #auth [2026-03-14]
> - [x] [done: created fixtures] Set up test fixtures for auth module [2026-03-13]
> - [~] [deferred: moving to Q3] Consider OAuth2 PKCE flow
> ```

## Policy File

A project MAY include an `MXIT.md` file in the project root (or `.mxit/config.md`) containing:

- **Agent Identity** — brief project context and agent instructions
- **Conventions** — project-specific rules (e.g. "run tests before marking done")
- **Runner Config** — HTML comment annotations for max-retries, max-concurrent, default-timeout

The policy file is optional. All defaults work without it.

## Runner Contract

A compliant mxit runner follows 5 steps:

1. Read the file, find **ready** tasks
2. Mark task `[@]` (or `[@agent-name]`)
3. Invoke agent — however it wants (subprocess, function call, API)
4. Agent does work, returns success or failure with a short message
5. Update task in file: new status + optional `[resolution]` + tags

**On failure:** Runner sets status back to `[ ]`, adds/increments `#error` tag. After MAX_RETRIES (default 3), adds `#stuck` and stops retrying.

**On success:** Runner sets status to `[x]`, adds `[keyword: message]` resolution bracket if agent returned a message.

**Crash recovery:** If a runner finds `[@]` tasks on startup, the previous run died mid-task. Reset `[@]` back to `[ ]` and re-execute.

## Tool Emission

Other tools and workflows MAY emit mxit tasks as output. When a tool discovers work that is too large to handle inline — design decisions, fundamental bugs, architecture issues needing human judgment — it SHOULD write tasks to the project's `TASKS.md`.

Emitted tasks SHOULD include a `#found` tag and a source tag identifying the tool (e.g. `#autorefine`, `#playtest`, `#review`). This makes tasks traceable to their origin.

> #### Example
>
> ```markdown
> ## Found by playtest (2026-03-15)
>
> - [ ] Permission system doesn't check nested resource access #found #playtest #security
> - [ ] CLI piping assumes CSV but list outputs TSV — design decision needed #found #playtest #design
>
> ## Found by autorefine (2026-03-15)
>
> - [ ] Resolution bracket format conflicts with markdown link syntax in edge cases #found #autorefine #spec
> ```

Emitted tasks MUST NOT be auto-dispatched. They wait for human review.

## TASKS Family (Scaling)

For larger projects, the mxit format scales beyond a single `TASKS.md` with optional companion files. All files use the same mxit format — the difference is scope and update frequency.

### File Roles

| File | Purpose | Updates |
|------|---------|---------|
| `TASKS.md` | The fridge list — what to work on RIGHT NOW | Daily |
| `TASKS-DESIGN.md` | Mission, goals, non-goals, project-level decisions & risks | Rarely (strategy shifts) |
| `TASKS-MAP.md` | Architecture tree, `#needs` dependencies, phased buildout | On milestones |
| `TASKS-{area}.md` | Deep backlog for a specific area (e.g. `TASKS-ui.md`) | As needed |

`TASKS.md` is always the working surface. The other files are optional — add them only when the project outgrows a single file.

All files MUST use the `TASKS-` prefix with UPPERCASE naming: `TASKS-DESIGN.md`, `TASKS-MAP.md`, `TASKS-SECURITY.md`, never `tasks-security.md` or `Tasks-Vision.md`. This matches the `TASKS.md` convention and makes the family visually distinct from code files. Even if the user says "tasks-security", normalize to `TASKS-SECURITY.md`.

Do NOT create separate `VISION.md`, `MAP.md`, or `ROADMAP.md` files — `TASKS-DESIGN.md` IS the project's vision document.

### TASKS-DESIGN.md

The project's only vision/mission/strategy document. Uses mxit brackets for goal/decision/risk status.

Recommended sections:

- **Mission** — one sentence
- **Goals** — `[x]` shipped, `[@]` in progress, `[ ]` planned, `[?]` undecided
- **Non-Goals** — `[*]` things explicitly out of scope
- **Decisions** — project-level calls using resolution brackets: `[x] [decided: Postgres] Database engine — why`
- **Risks** — `[!]` active risk, `[?]` uncertain, `[x] [resolved: ...]` handled

Decision lifecycle: `[?]` open question → `[x] [decided: choice]` settled → `[~] [reversed: reason]` overturned.

Area-specific decisions and risks belong in the relevant `TASKS-{area}.md` file, not in VISION.

### TASKS-MAP.md

Bird's-eye architecture tree with structured dependencies and phased buildout.

#### Dependencies with `#needs:tag`

Every MAP item MAY have an `#id` tag and `#needs:tag` references:

```markdown
- [x] Database schema #db-schema
- [@] API layer #api #needs:db-schema
- [ ] Dashboard #dashboard #needs:api #needs:design-system
```

Items with unmet `#needs` are not ready. Items whose `#needs` are all `[x]` can be worked in parallel.

#### Phases

Phases are headings with optional due dates:

```markdown
## Phase 1: Foundation -> 2026-Q1 [shipped 2026-02-28]

- [x] Database schema #db-schema
- [x] Auth endpoints #auth-api #needs:db-schema

## Phase 2: Core Product -> 2026-Q2

- [@] Search #search-api #needs:db-schema
- [ ] Dashboard #dashboard #needs:search-api
```

When a phase completes, add `[shipped DATE]` to the heading. The `[x]` items become the shipping record.

#### Lanes

For large phases, group parallel workstreams:

```markdown
## Phase 2: Core Product -> 2026-Q2

### Lane A: Data (ready now)

- [@] Search #search-api #needs:db-schema
- [@] Background jobs #bg-jobs #needs:db-schema

### Lane B: UI (blocked until Lane A)

- [ ] Dashboard #dashboard #needs:search-api

### Lane C: Infra (independent)

- [ ] CDN setup #cdn
```

Lanes are organizational headings — the `#needs` tags define the actual dependency graph.

#### Cross-file linking

MAP items MAY link to area files using backtick notation:

```markdown
- [@] Search — Typesense #search-api `-> TASKS-api.md`
```

### Rules

1. A task lives in ONE place — don't duplicate across files
2. `TASKS.md` references area files but doesn't copy tasks from them
3. `#needs` tags MAY reference items across files (MAP items referenced from area files)
4. Only create `TASKS-{area}.md` when an area has 5+ tasks

## Full Example

```markdown
# Auth Refactor

## References

- Backend API: `backend/TASKS.md`
- Design doc: `design/auth-redesign.md`

## Core

- [x] [done: extracted to auth/validation.ts] Extract token validation #auth #refactor [2026-03-14]
- [@claude-1] Add refresh token support #auth #feature
  - [x] [done: designed rotation strategy] Design token rotation strategy
  - [@] Implement rotation endpoint
  - [ ] Handle edge case: expired refresh token
    <!-- test: deno test auth/refresh_test.ts -->
- [ ] Write integration tests for new token flow #auth #test
  <!-- test: deno test auth/ -->
  <!-- timeout: 10m -->
  <!-- budget: $1.00 -->
- [!] Fix race condition in concurrent token refresh #auth #bug #error="test timeout after 30s"
- [ ] Migrate legacy session tokens #auth #migration #error=3 #stuck

## Discovered During Work

- [ ] Rate limiter doesn't account for refresh token requests #discovered
- [ ] Token expiry edge case on DST change #discovered

## Post-Refactor

- [ ] Update API docs for new token endpoints #docs
- [ ] Remove deprecated /api/v1/session endpoint #cleanup
- [~] [deferred: moving to Q3] Consider OAuth2 PKCE flow
- [*] Remember to check Redis config before deploy

## Archive

- [x] [done: found 12 direct references] Audit existing token usage [2026-03-13]
- [x] [done: created fixtures] Set up test fixtures for auth module [2026-03-13]
```

## Appendix

### Compatibility

mxit is designed to be a superset of GitHub-flavored markdown checkboxes.
Any standard `- [ ]` or `- [x]` item is valid mxit.

GitHub will render `- [ ]` and `- [x]` as interactive checkboxes.
The extended statuses (`[@]`, `[~]`, `[?]`, `[!]`, `[*]`) will render
as plain text in brackets, which is readable if not interactive.

### Quick Reference

```
STATUSES (brackets = what the item IS)
- [ ] open          Actionable — pick up
- [@] ongoing       In progress (crash recovery: reset to [ ] on startup)
- [x] done          Skip
- [~] obsolete      Skip
- [?] in question   Skip — needs discussion
- [!] important     Actionable — prioritize over [ ]
- [*] starred       Skip — informational only

EXECUTION STATE (tags = what happened to it)
#error              Failed on last attempt, eligible for retry
#error=N            Failed N times
#error="message"    Error detail
#stuck              Runner gave up, needs human
#blocked-by:tag     Blocked until no open task has that tag
#needs:tag          Blocked until that tag's item is [x] (architecture deps)
#discovered         Found during execution of parent task

RESOLUTION
- [x] [fixed: rewrote validation] Task description #tag [2026-03-14]

ANNOTATIONS (HTML comments under task)
<!-- test: deno test api_test.ts -->
<!-- accept: all edge cases handled -->
<!-- timeout: 5m -->
<!-- budget: $0.50 -->

READY (actionable when all true)
  status is [ ] or [!]
  no children in [ ], [@], or [!]
  no #blocked-by:tag where tag exists on open task
  no #needs:tag where tag exists on non-[x] item
  no #stuck tag

TASKS FAMILY (scaling for larger projects)
  TASKS.md              the fridge list (daily)
  TASKS-DESIGN.md       mission, goals, decisions, risks (rarely)
  TASKS-MAP.md          architecture + #needs deps + phases (milestones)
  TASKS-{area}.md       deep backlog per area (as needed)

REGEX
^(\s*)- \[([ x~@!?*])\]\s+(.+)$
```

### Differences from xit!

| Feature | xit! | mxit |
|---------|------|------|
| Line prefix | none | `- ` (markdown bullet) |
| Sub-items | not supported | unlimited nesting |
| Titles | plain text (not starting with `[`) | markdown headings (`#`, `##`, etc.) |
| Priority | separate `!`/`!!` field after checkbox | `[!]` as status + bullet order |
| Visual padding | `..!` / `!!.` syntax | not supported (unnecessary) |
| Starred status | not available | `[*]` |
| In question | `[?]` | `[?]` (same) |
| Error/retry | not specified | `#error`, `#error=N`, `#stuck` tags |
| Resolution | not specified | `[keyword: message]` bracket |
| Multi-agent | not specified | `[@agent-name]` claiming |
| Discovery | not specified | `#discovered` tag under parent |
| Dependencies | not specified | `#needs:tag` and `#blocked-by:tag` |
| File scaling | not specified | TASKS family (VISION, MAP, area files) |
| Archival | not specified | `## Archive` section or `TASKS.done.md` |
| Annotations | not specified | HTML comments (`<!-- key: value -->`) |
| Policy file | not specified | `MXIT.md` |
| File extension | `.xit` | `.md` |
| Multi-line descriptions | 4-space indent continuation | not supported (use sub-items) |

### Glossary

- Blank line: a line that is either empty, or that exclusively consists of whitespace
- Digit: `0`-`9`
- Letter: a character from the Unicode Letter category (L)
- Newline: `\n` or `\r\n`
- Runner: a program that reads mxit files, dispatches tasks to agents, and updates the file with results
- Agent: an AI model or process that executes a task and returns success/failure

### Changelog

#### Version 0.4

- Add `#needs:tag` for architecture-level dependencies (same blocking semantics as `#blocked-by`)
- Add TASKS Family scaling: TASKS-DESIGN.md, TASKS-MAP.md, TASKS-{area}.md companion files
- Add phased buildout convention with `[shipped DATE]` annotations
- Add lanes for parallel workstreams within phases
- Add agent nicknames convention (adjective-animal, ephemeral)
- Add `decided`, `reversed`, `resolved` as recommended resolution keywords
- Add cross-file linking with backtick `-> TASKS-{area}.md` notation
- Claims are explicitly advisory, not locks

#### Version 0.3

- Add tool emission convention: tools (playtest, autorefine, etc.) MAY emit tasks to TASKS.md with `#found` + source tag
- Add `MXIT_SPEC.md` as standalone distributable spec filename
- Emitted tasks MUST NOT be auto-dispatched

#### Version 0.2

- Remove `[!!]` and `[!!!]` — importance is a single `[!]` status; use `#stuck` for escalation
- Add execution state tags: `#error`, `#error=N`, `#error="message"`, `#stuck`, `#blocked-by:tag`
- Add resolution annotation format: `[keyword: message]`
- Add multi-agent claiming: `[@agent-name]`
- Add discovery convention: `#discovered` tag
- Add ready semantics (when a task is actionable)
- Add archival section (`## Archive` or `TASKS.done.md`)
- Add annotations via HTML comments (`<!-- key: value -->`)
- Add references section for cross-file linking
- Add policy file (`MXIT.md`)
- Add runner contract (5-step lifecycle)
- Add timestamp format `[yyyy-mm-dd]`

#### Version 0.1

- Initial spec based on xit! v1.1
- Added markdown bullet syntax, sub-items, heading titles
- Added `[!]`, `[*]` statuses
