import type { Task } from "./types.ts";

/** Check if a task has a specific tag */
function hasTag(task: Task, name: string): boolean {
  return task.tags.some((t) => t.name === name);
}

/**
 * A task is "ready" when:
 * - Status is " " (open) or "!" (important)
 * - No children are in " ", "@", or "!" status
 * - No #blocked-by:tag where that tag exists on an open task in the full list
 * - No #stuck tag
 */
export function getReady(tasks: Task[], allTasks?: Task[]): Task[] {
  const flatAll = allTasks ?? flattenTasks(tasks);
  const openTags = collectOpenTags(flatAll);

  const ready: Task[] = [];
  collectReady(tasks, openTags, ready);
  return ready;
}

/** Recursively find ready tasks at all nesting levels */
function collectReady(tasks: Task[], openTags: Set<string>, ready: Task[]): void {
  for (const task of tasks) {
    if (isReady(task, openTags)) {
      ready.push(task);
    }
    // Also check children — a child can be ready even if parent isn't
    if (task.children.length > 0) {
      collectReady(task.children, openTags, ready);
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
function isReady(task: Task, openTags: Set<string>): boolean {
  // Must be open or important
  if (task.status !== " " && task.status !== "!") return false;

  // Must not be stuck
  if (hasTag(task, "stuck")) return false;

  // Must not have pending children
  const hasPendingChildren = task.children.some(
    (c) => c.status === " " || c.status === "@" || c.status === "!"
  );
  if (hasPendingChildren) return false;

  // Must not be blocked by an open tag
  for (const tag of task.tags) {
    if (tag.name === "blocked-by" && typeof tag.value === "string") {
      if (openTags.has(tag.value)) return false;
    }
  }

  return true;
}
