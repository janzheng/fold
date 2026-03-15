import type { Task, Tag } from "./types.ts";

const TASK_RE = /^(\s*)- \[([ x~@!?*]|@[^\]]*)\]\s+(.+)$/;
const ANNOTATION_RE = /^(\s*)<!--\s*(\w+):\s*(.+?)\s*-->$/;

/** Serialize a Tag back to its string form */
function serializeTag(tag: Tag): string {
  if (tag.value === undefined) return `#${tag.name}`;
  // Use : separator for blocked-by (spec convention), = for everything else
  if (tag.name === "blocked-by" && typeof tag.value === "string") {
    return `#${tag.name}:${tag.value}`;
  }
  if (typeof tag.value === "string") return `#${tag.name}="${tag.value}"`;
  return `#${tag.name}=${tag.value}`;
}

/** Serialize a single task line (without children or annotations) */
function serializeTaskLine(task: Task): string {
  const indent = "  ".repeat(task.indent);
  const status = task.status === "@" && task.agent
    ? `@${task.agent}`
    : task.status;

  let line = `${indent}- [${status}]`;

  // Resolution bracket
  if (task.resolution) {
    line += ` [${task.resolution.keyword}: ${task.resolution.message}]`;
  }

  // Description
  line += ` ${task.description}`;

  // Tags
  if (task.tags.length > 0) {
    line += " " + task.tags.map(serializeTag).join(" ");
  }

  // Due date
  if (task.due) {
    line += ` -> ${task.due.raw}`;
  }

  return line;
}

/** Serialize annotations as HTML comments */
function serializeAnnotations(annotations: Record<string, string>, indent: number): string[] {
  const pad = "  ".repeat(indent);
  return Object.entries(annotations).map(
    ([key, value]) => `${pad}  <!-- ${key}: ${value} -->`
  );
}

/** Recursively serialize a task and all its children */
function serializeTaskTree(task: Task, lines: string[]): void {
  lines.push(serializeTaskLine(task));

  if (Object.keys(task.annotations).length > 0) {
    lines.push(...serializeAnnotations(task.annotations, task.indent));
  }

  for (const child of task.children) {
    serializeTaskTree(child, lines);
  }
}

/** Serialize Task[] back to markdown (task lines only, no document context) */
export function serializeTasks(tasks: Task[]): string {
  const lines: string[] = [];
  for (const task of tasks) {
    serializeTaskTree(task, lines);
  }
  return lines.join("\n");
}

/**
 * Apply modified Task[] back into the original markdown, preserving all
 * non-task lines (headings, blank lines, prose). Tasks are matched by
 * their original line number and replaced in-place.
 */
export function applyTasks(originalMarkdown: string, tasks: Task[]): string {
  const lines = originalMarkdown.split("\n");

  // Build a map of line number → replacement content
  const replacements = new Map<number, string[]>();
  // Track which original lines are "owned" by a task
  const ownedLines = new Set<number>();

  // Collect all tasks (including nested) that need replacing
  function collectReplacements(task: Task, isRoot: boolean) {
    ownedLines.add(task.line);
    markAnnotationLines(lines, task.line - 1, ownedLines);

    if (isRoot) {
      // Root tasks get a replacement block with all descendants
      const taskLines: string[] = [];
      serializeTaskTree(task, taskLines);
      replacements.set(task.line, taskLines);
    }

    // Mark all child lines as owned (they'll be part of the root's replacement)
    for (const child of task.children) {
      collectReplacements(child, false);
    }
  }

  for (const task of tasks) {
    collectReplacements(task, true);
  }

  // Rebuild the document
  const result: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;

    if (replacements.has(lineNum)) {
      result.push(...replacements.get(lineNum)!);
    } else if (!ownedLines.has(lineNum)) {
      result.push(lines[i]);
    }
  }

  return result.join("\n");
}

/** Mark annotation lines following a task as owned */
function markAnnotationLines(lines: string[], taskIndex: number, owned: Set<number>): void {
  for (let j = taskIndex + 1; j < lines.length; j++) {
    if (ANNOTATION_RE.test(lines[j])) {
      owned.add(j + 1);
    } else if (TASK_RE.test(lines[j]) && lines[j].match(/^\s+/)) {
      break;
    } else {
      break;
    }
  }
}
