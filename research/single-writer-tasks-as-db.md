# TASKS.md as a Single-Writer Database

*Inspired by ["More databases should be single-threaded"](https://blog.konsti.xyz/more-databases-should-be-single-threaded/) by Konstantin Wohlwend (Dec 2025). The parallels to how mxit treats TASKS files are striking — but the takeaway is "keep it simple," not "add database machinery."*

---

## The Parallel

The article argues: most transactional databases should be single-threaded and aggressively sharded. One writer per shard, many readers, no locks, no deadlocks, no retries.

TASKS.md already works this way — by accident:

| DB concept | TASKS.md equivalent |
|---|---|
| Single file, single writer | One markdown file, one agent edits at a time |
| Multiple readers | Any agent can read any TASKS file |
| Sharding by key | TASKS family — TASKS-DESIGN.md, TASKS-AUDIT.md, TASKS-{area}.md |
| Shard key | The "area" or concern |
| Cross-shard query | Reading multiple TASKS files to understand dependencies |
| Serializable transactions | One agent marks one task done at a time |
| Deadlocks | Two agents editing TASKS.md simultaneously (we've seen this) |

## What We Already Get Right

1. **TASKS family IS sharding.** Splitting into TASKS-DESIGN.md, TASKS-AUDIT.md etc. = one shard per concern. This happened organically because big files are hard to work with — but it's also the right database design.

2. **fold:mxit:run dispatches to separate areas.** Fan-out assigns each agent to their own tasks. They don't compete for the same file. Single-writer-per-shard, by convention.

3. **fold:audit writes to TASKS-AUDIT.md.** Its own shard. Doesn't compete with TASKS.md.

4. **Tags as cross-shard references.** `#needs A042` is a reference, not a foreign key. No joins, no transactions, just "go look at that other file."

## What Could Go Wrong (But Rarely Does)

- Two agents writing to the same TASKS.md in worktrees → merge conflict, lost updates
- Cross-file dependencies with no enforcement → a task blocks on something in another file that got deleted
- No conflict detection → silent data loss if two agents edit the same line

## The Takeaway: Don't Add Machinery

The temptation is to add locking, conflict detection, retry logic. **Don't.**

The article's real insight isn't "add database features to your files." It's: **if your architecture naturally avoids conflicts, you don't need conflict resolution.** Single-writer-per-shard means conflicts can't happen.

For mxit, this means:
- **Keep sharding by concern** (TASKS family) — it's already the right pattern
- **Keep fan-out assigning agents to separate files** — single-writer by convention
- **Keep tags for cross-references** — eventual consistency, not transactions
- **Accept brief inconsistency** — reconcile at the end of a wave, not during
- **If two agents need the same file, serialize them** — run one, then the other. Don't parallelize.

The simplicity IS the feature. A markdown file with `- [ ]` checkboxes that any agent can read is better than a proper database that needs drivers, migrations, and connection pools. The moment you add locking to TASKS.md, you've lost the plot.

## Source

- Blog post: https://blog.konsti.xyz/more-databases-should-be-single-threaded/
- Key references: ScyllaDB "shard-per-core," VoltDB, Cloudflare Workers actor model
- The article's main argument: aggressive sharding + single-writer per shard = no deadlocks, no retries, always-serializable, horizontally scalable
