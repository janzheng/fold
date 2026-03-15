import { parseTasks } from "./parse.ts";
import type { Task, Tag } from "./types.ts";

const TASK_RE = /^(\s*)- \[([ x~@!?*]|@[^\]]*)\]\s+(.+)$/;
const TAG_RE = /#(\w[\w-]*)(?:=(?:"([^"]*)"|([\w.]+)))?/g;

/** Read file, apply transform to a specific line, write back */
async function modifyLine(
  filePath: string,
  lineNum: number,
  transform: (line: string) => string,
): Promise<void> {
  const content = await Deno.readTextFile(filePath);
  const lines = content.split("\n");
  const idx = lineNum - 1;
  if (idx < 0 || idx >= lines.length) {
    throw new Error(`Line ${lineNum} out of range (file has ${lines.length} lines)`);
  }
  const original = lines[idx];
  if (!TASK_RE.test(original)) {
    throw new Error(`Line ${lineNum} is not a valid mxit task`);
  }
  lines[idx] = transform(original);
  await Deno.writeTextFile(filePath, lines.join("\n"));
}

/** Replace the status bracket in a task line */
function replaceStatus(line: string, newStatus: string): string {
  return line.replace(/- \[[^\]]*\]/, `- [${newStatus}]`);
}

/** Add a tag to a line (before any trailing timestamp) */
function addTag(line: string, tag: string): string {
  // Append before trailing [timestamp] if present
  const timestampMatch = line.match(/\s+\[\d{4}-\d{2}.*\]$/);
  if (timestampMatch) {
    const pos = line.lastIndexOf(timestampMatch[0]);
    return line.slice(0, pos) + ` ${tag}` + line.slice(pos);
  }
  return line + ` ${tag}`;
}

/** Remove a tag by name from a line */
function removeTag(line: string, tagName: string): string {
  const re = new RegExp(`\\s*#${tagName}(?:=(?:"[^"]*"|[\\w.]+))?`, "g");
  return line.replace(re, "");
}

/** Insert a resolution bracket after the status bracket */
function insertResolution(line: string, keyword: string, message: string): string {
  return line.replace(
    /^(\s*- \[[^\]]*\])\s+/,
    `$1 [${keyword}: ${message}] `,
  );
}

/**
 * Claim a task — set status to [@agent-name]
 */
export async function claimTask(
  filePath: string,
  lineNum: number,
  agentName: string,
): Promise<void> {
  await modifyLine(filePath, lineNum, (line) => {
    return replaceStatus(line, `@${agentName}`);
  });
}

/**
 * Complete a task — set status to [x], optionally add resolution bracket
 */
export async function completeTask(
  filePath: string,
  lineNum: number,
  result?: string,
): Promise<void> {
  await modifyLine(filePath, lineNum, (line) => {
    let updated = replaceStatus(line, "x");
    // Remove error/stuck tags
    updated = removeTag(updated, "error");
    updated = removeTag(updated, "stuck");
    if (result) {
      updated = insertResolution(updated, "done", result);
    }
    return updated;
  });
}

/**
 * Fail a task — set status back to [ ], add/increment #error tag.
 * After maxRetries, add #stuck.
 */
export async function failTask(
  filePath: string,
  lineNum: number,
  error: string,
  maxRetries = 3,
): Promise<void> {
  await modifyLine(filePath, lineNum, (line) => {
    let updated = replaceStatus(line, " ");

    // Find existing error count
    const errorCountMatch = line.match(/#error=(\d+)/);
    const currentCount = errorCountMatch ? parseInt(errorCountMatch[1]) : 0;
    const newCount = currentCount + 1;

    // Remove old error tags
    updated = removeTag(updated, "error");

    // Add new error tag with count and message
    updated = addTag(updated, `#error=${newCount}`);
    updated = addTag(updated, `#error="${error}"`);

    // Add stuck if at max
    if (newCount >= maxRetries) {
      updated = addTag(updated, "#stuck");
    }

    return updated;
  });
}

/**
 * Crash recovery — find all [@...] tasks and reset to [ ]
 * Returns the number of tasks reset.
 */
export async function resetCrashed(filePath: string): Promise<number> {
  const content = await Deno.readTextFile(filePath);
  const lines = content.split("\n");
  let count = 0;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(\s*)- \[@[^\]]*\]/);
    if (match) {
      lines[i] = replaceStatus(lines[i], " ");
      count++;
    }
  }

  if (count > 0) {
    await Deno.writeTextFile(filePath, lines.join("\n"));
  }
  return count;
}

/**
 * Add a discovered subtask under a parent task
 */
export async function addDiscoveredTask(
  filePath: string,
  parentLineNum: number,
  title: string,
  tags: string[] = [],
): Promise<void> {
  const content = await Deno.readTextFile(filePath);
  const lines = content.split("\n");
  const parentIdx = parentLineNum - 1;

  if (parentIdx < 0 || parentIdx >= lines.length) {
    throw new Error(`Parent line ${parentLineNum} out of range`);
  }
  if (!TASK_RE.test(lines[parentIdx])) {
    throw new Error(`Line ${parentLineNum} is not a valid mxit task`);
  }

  // Build the new child line
  const tagStr = [...tags, "discovered"].map((t) => `#${t}`).join(" ");
  const childLine = `  - [ ] ${title} ${tagStr}`;

  // Find insertion point — after parent + its annotations + existing children
  let insertAt = parentIdx + 1;
  while (insertAt < lines.length) {
    const next = lines[insertAt];
    // Continue past annotations and child tasks
    if (/^\s+<!--/.test(next) || /^\s+- \[/.test(next)) {
      insertAt++;
    } else {
      break;
    }
  }

  lines.splice(insertAt, 0, childLine);
  await Deno.writeTextFile(filePath, lines.join("\n"));
}
