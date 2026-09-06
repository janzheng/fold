import type { Task } from "./types.ts";

/** Check if a task has a specific tag */
function hasTag(task: Task, name: string): boolean {
  return task.tags.some((t) => t.name === name);
}

/**
 * A task is "ready" when:
 * - Status is " " (open) or "!" (important)
 * - No children are in " ", "@", or "!" status
 * - Dependencies satisfied and no stuck/review/approval gate on it or ancestors
 * allTasks supplies dependency context (trees or flat tasks); candidates are always included.
 */
export function getReady(tasks: Task[], allTasks?: Task[]): Task[] {
  const flatAll = flattenTasks([...tasks, ...(allTasks ?? [])]);
  const openTags = collectOpenTags(flatAll);
  const knownTags = new Set(flatAll.flatMap((t) => t.tags.map((tag) => tag.name)));
  const nonDoneTags = new Set(flatAll.filter((t) => t.status !== "x")
    .flatMap((t) => t.tags.map((tag) => tag.name)));

  function isGated(task: Task): boolean {
    if (["stuck", "discovered", "needs-approval"].some((tag) => hasTag(task, tag))) return true;
    return task.tags.some((tag) => {
      if (tag.name === "needs") {
        return typeof tag.value !== "string" || !knownTags.has(tag.value) || nonDoneTags.has(tag.value);
      }
      return tag.name === "blocked-by" && typeof tag.value === "string" && openTags.has(tag.value);
    });
  }

  const ready: Task[] = [];
  collectReady(tasks, isGated, ready);
  return ready;
}

/** Recursively find ready tasks at all nesting levels */
function collectReady(tasks: Task[], isGated: (task: Task) => boolean, ready: Task[]): void {
  for (const task of tasks) {
    // Gates apply to the whole subtree; pending children alone do not gate siblings.
    if (isGated(task)) continue;
    if (isReady(task)) {
      ready.push(task);
    }
    // Also check children — a child can be ready even if parent isn't
    if (task.children.length > 0) {
      collectReady(task.children, isGated, ready);
    }
  }
}

/** Flatten entire task tree into a single array */
function flattenTasks(tasks: Task[]): Task[] {
  const flat: Task[] = [];
  function walk(list: Task[]) {
    for (const task of list) {
      flat.push(task);
      walk(task.children);
    }
  }
  walk(tasks);
  return flat;
}

/** Collect all tags from open tasks (status " ", "@", or "!") */
function collectOpenTags(tasks: Task[]): Set<string> {
  const tags = new Set<string>();
  for (const task of tasks) {
    if (task.status === " " || task.status === "@" || task.status === "!") {
      for (const tag of task.tags) {
        tags.add(tag.name);
      }
    }
  }
  return tags;
}

/** Check if a single task is ready */
function isReady(task: Task): boolean {
  // Must be open or important
  if (task.status !== " " && task.status !== "!") return false;

  // Must not have pending children
  const hasPendingChildren = task.children.some(
    (c) => c.status === " " || c.status === "@" || c.status === "!"
  );
  if (hasPendingChildren) return false;

  return true;
}
