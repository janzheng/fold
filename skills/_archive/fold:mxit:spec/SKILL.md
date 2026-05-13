<!--
ARCHIVED 2026-04-30 — unregistered from hub via commit f9706c6c
("chore(skills): unregister 10 fold skills (round 1 triage)").
Reason cited in commit: "specialized sub-skill."

Moved into `__active/_apps/fold/skills/_archive/` on 2026-05-13 so it
no longer sits alongside live skills. Content unmodified.

To revive as a standalone skill:
  1. git mv this dir back to `../fold:mxit:spec/` (out of `_archive/`)
  2. Delete this comment block
  3. Copy to `mcp-hub/skills/fold:mxit:spec/` and run `sync-skills.sh`
-->
---
name: fold:mxit:spec
description: "Write and manage delta specs — ADDED/MODIFIED/REMOVED requirements with GIVEN/WHEN/THEN scenarios as mxit checkboxes. Use when creating SPECS.md for a change, updating project specs, or working with behavior contracts."
version: 1.0.0
license: MIT
---

# fold:mxit:spec — Delta Specs as mxit

Write behavior specs using the same mxit checkbox format as tasks. Spec scenarios are checkboxes. The same parser, same visual scannability, same resolution brackets.

## Core idea

Specs describe what the system SHOULD do. Tasks describe what to BUILD. They use the same format because **a spec scenario is just a task that hasn't been implemented yet.**

```
- [ ] WHEN user logs in THEN issue JWT          <- spec (not yet implemented)
- [@claude-1] WHEN user logs in THEN issue JWT  <- task (being implemented)
- [x] [done: JWT middleware] WHEN user logs in   <- log (implemented, with result)
- [x] [approved: 2026-03-26] WHEN user logs in   <- accepted state
```

## Spec file format

### Project specs (`SPECS.md` or `specs/` directory)

For small projects, one file:

```markdown
# Project Specs

## auth

### Session Management
The system MUST manage user sessions.

- [x] [approved] WHEN user logs in THEN issue a JWT token
- [x] [approved] WHEN 30 min pass without activity THEN expire session
- [ ] WHEN user has "remember me" THEN extend to 7 days

### Two-Factor Auth
The system SHOULD support TOTP-based 2FA.

- [ ] WHEN user enables 2FA THEN show QR code
- [ ] WHEN 2FA user logs in THEN require OTP after password
```

For larger projects, use a directory:

```
specs/
  auth/spec.md
  payments/spec.md
  ui/spec.md
```

### Delta specs (in `changes/<name>/SPECS.md`)

Delta specs describe WHAT'S CHANGING relative to current specs. Three sections:

```markdown
# Specs: Add Two-Factor Auth

## ADDED Requirements

### TOTP Authentication
The system MUST support time-based one-time passwords.

- [ ] WHEN user enables 2FA THEN generate TOTP secret and show QR code
- [ ] WHEN user enters valid OTP THEN activate 2FA on account
- [ ] WHEN 2FA user logs in with password THEN prompt for OTP
- [ ] WHEN OTP is invalid THEN reject login, increment failure count
- [ ] WHEN OTP failures reach 5 THEN lock account for 15 minutes

## MODIFIED Requirements

### Session Expiration
The system MUST expire sessions after 15 minutes of inactivity.
*(Previously: 30 minutes — tightened for 2FA security)*

- [ ] WHEN 15 min pass without activity THEN expire session #spec:modified

## REMOVED Requirements

### Remember Me
*(Deprecated — incompatible with 2FA security requirements)*
```

## Scenario format

Use GIVEN/WHEN/THEN (or just WHEN/THEN for simplicity):

```markdown
- [ ] GIVEN a user with valid credentials WHEN they submit login THEN issue JWT
- [ ] WHEN user clicks logout THEN invalidate session
- [ ] WHEN API receives expired token THEN return 401
```

**Keep scenarios testable.** Each should be verifiable — either by a test or by manual inspection.

## RFC 2119 keywords

Use requirement strength keywords in the requirement description (not in scenarios):

| Keyword | Meaning |
|---------|---------|
| **MUST** / **SHALL** | Absolute requirement |
| **SHOULD** | Recommended, but exceptions exist |
| **MAY** | Optional |

```markdown
### Token Refresh
The system MUST refresh tokens before expiry.    <- non-negotiable
The system SHOULD use sliding window refresh.     <- preferred approach
The system MAY cache refresh tokens client-side.  <- optional optimization
```

## Linking tasks to specs

In TASKS.md, use `#spec:` tags to connect tasks to spec requirements:

```markdown
- [ ] Implement session timeout middleware #backend #spec:auth/session-expiration
- [ ] Add 2FA enrollment flow #frontend #spec:auth/totp-authentication
```

The `#spec:` tag is a cross-reference — it tells the agent (and humans) which spec requirement this task implements.

## Spec lifecycle with resolution brackets

```markdown
## auth

### Session Management

- [x] [approved: 2026-03-15] WHEN user logs in THEN issue JWT
- [x] [approved: 2026-03-15] WHEN 30 min idle THEN expire session
- [~] [deferred: Q3] WHEN remember-me checked THEN extend to 7 days
- [?] [needs: security review] WHEN token expires THEN auto-refresh
- [ ] WHEN 2FA enabled THEN require OTP after password #spec:new
```

| Status + Resolution | Meaning |
|---|---|
| `[ ]` | Proposed, not yet approved |
| `[x] [approved: date]` | Accepted spec — implement this |
| `[~] [deferred: reason]` | Postponed — not in current scope |
| `[?] [needs: what]` | Needs input before approving |
| `#spec:new` | New in this change (not yet in main specs) |
| `#spec:modified` | Changed from existing spec |

## Merging on archive

When a change is archived, delta specs merge into the main spec file:

- **ADDED** requirements: append to the relevant section
- **MODIFIED** requirements: replace the existing requirement text
- **REMOVED** requirements: delete from the spec

After merge, the main spec file reflects the current state of the system.

## Rules

- **Scenarios are mxit checkboxes.** Same parser, same visual format. Not prose paragraphs.
- **Specs describe behavior, not implementation.** "WHEN user logs in THEN issue JWT" not "call generateToken() in auth.ts"
- **Delta specs only describe changes.** Don't restate unchanged requirements.
- **One requirement, multiple scenarios.** Group related scenarios under a requirement heading.
- **Keep it lightweight.** Not every task needs a spec. Use for: behavior contracts, API surfaces, user-facing features. Skip for: refactors, dependency updates, config changes.
