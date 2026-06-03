import type { Task, TaskStatus, Tag, Resolution, DueDate } from "./types.ts";

/** Regex matching an mxit task line */
const TASK_RE = /^(\s*)- \[([ x~@!?*])\]\s+(.+)$/;

/** Regex matching [@agent-name] at the start — status char is @ but bracket has the name */
const AGENT_BRACKET_RE = /^(\s*)- \[(@[^\]]*)\]\s+(.+)$/;

/** Regex matching HTML comment annotations */
const ANNOTATION_RE = /^(\s*)<!--\s*(\w+):\s*(.+?)\s*-->$/;

/** Regex matching a resolution bracket: [keyword: message] at start of string */
const RESOLUTION_RE = /^\[(\w+):\s*(.+?)\]/;

/** Regex matching tags: #tag, #tag=value, #tag="quoted value", #tag:value */
const TAG_RE = /#(\w[\w-]*)(?:[=:](?:"([^"]*)"|([\w.:-]+)))?/g;

/** Regex matching due dates: -> 2026-03-31, -> 2026-Q2, -> 2026-W12, -> 2026, etc. */
const DUE_RE = /->\s*(\d{4}(?:[-/](?:Q[1-4]|W\d{1,2}|\d{2}(?:[-/]\d{2})?))?)/;

/** Parse a tag value — unquoted numbers become numbers, everything else stays string */
function parseTagValue(quoted: string | undefined, unquoted: string | undefined): string | number | undefined {
  if (quoted !== undefined) return quoted;
  if (unquoted === undefined) return undefined;
  const num = Number(unquoted);
  return Number.isFinite(num) ? num : unquoted;
}

/** Extract tags from a description string, returning tags and the cleaned description */
function extractTags(text: string): { description: string; tags: Tag[] } {
  const tags: Tag[] = [];
  let match: RegExpExecArray | null;
  const re = new RegExp(TAG_RE.source, TAG_RE.flags);

  while ((match = re.exec(text)) !== null) {
    tags.push({
      name: match[1],
      value: parseTagValue(match[2], match[3]),
    });
  }

  // Remove tags from description, trim trailing whitespace
  const description = text.replace(TAG_RE, "").replace(/\s+$/, "").replace(/\s{2,}/g, " ");
  return { description, tags };
}

/** Extract resolution bracket from the start of remaining text */
function extractResolution(text: string): { resolution?: Resolution; rest: string } {
  const trimmed = text.trimStart();
  const match = trimmed.match(RESOLUTION_RE);
  if (match) {
    const afterBracket = trimmed.slice(match[0].length).trimStart();
    return {
      resolution: { keyword: match[1], message: match[2] },
      rest: afterBracket,
    };
  }
  return { rest: text };
}

/** Extract due date from text, returning the due date and cleaned text */
function extractDueDate(text: string): { due?: DueDate; rest: string } {
  const match = text.match(DUE_RE);
  if (!match) return { rest: text };

  const raw = match[1];
  const date = resolveDueDate(raw);
  if (!date) return { rest: text };

  const rest = text.replace(DUE_RE, "").replace(/\s+$/, "").replace(/\s{2,}/g, " ");
  return { due: { raw, date }, rest };
}

/** Resolve a due date pattern to a concrete Date (last day of period for ranges) */
function resolveDueDate(raw: string): Date | null {
  const sep = raw.includes("/") ? "/" : "-";
  const parts = raw.split(sep);

  const year = parseInt(parts[0]);
  if (isNaN(year)) return null;

  // Year only: 2026 → Dec 31
  if (parts.length === 1) {
    return new Date(year, 11, 31);
  }

  const second = parts[1];

  // Quarter: Q1-Q4
  if (second.startsWith("Q")) {
    const q = parseInt(second.slice(1));
    if (q < 1 || q > 4) return null;
    // Last day of quarter: Q1=Mar31, Q2=Jun30, Q3=Sep30, Q4=Dec31
    const lastMonth = q * 3; // 3, 6, 9, 12
    return new Date(year, lastMonth, 0); // day 0 = last day of prev month
  }

  // Week: W12
  if (second.startsWith("W")) {
    const week = parseInt(second.slice(1));
    if (week < 1 || week > 53) return null;
    // ISO week: Jan 4 is always in week 1
    const jan4 = new Date(year, 0, 4);
    const dayOfWeek = jan4.getDay() || 7; // 1=Mon, 7=Sun
    const firstMonday = new Date(year, 0, 4 - dayOfWeek + 1);
    const weekStart = new Date(firstMonday);
    weekStart.setDate(firstMonday.getDate() + (week - 1) * 7);
    // Last day of the week (Sunday)
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
  }

  const month = parseInt(second);
  if (isNaN(month) || month < 1 || month > 12) return null;

  // Month only: 2026-03 → Mar 31
  if (parts.length === 2) {
    return new Date(year, month, 0); // day 0 = last day of month
  }

  // Full date: 2026-03-31
  const day = parseInt(parts[2]);
  if (isNaN(day) || day < 1 || day > 31) return null;
  return new Date(year, month - 1, day);
}

/** Parse an mxit markdown string into Task[] */
export function parseTasks(markdown: string): Task[] {
  const lines = markdown.split("\n");

  // First pass: parse all task lines flat
  const flat: Task[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Try agent bracket first: [@agent-name]
    const agentMatch = line.match(AGENT_BRACKET_RE);
    if (agentMatch) {
      const indentChars = agentMatch[1].length;
      const depth = Math.floor(indentChars / 2);
      const agentStr = agentMatch[2];
      const rest = agentMatch[3];

      const { resolution, rest: afterResolution } = extractResolution(rest);
      const { due, rest: afterDue } = extractDueDate(afterResolution);
      const { description, tags } = extractTags(afterDue);
      const annotations = collectAnnotations(lines, i, indentChars);

      flat.push({
        line: lineNum,
        indent: depth,
        status: "@" as TaskStatus,
        description,
        resolution,
        due,
        tags,
        agent: agentStr.length > 1 ? agentStr.slice(1) : undefined,
        raw: line,
        children: [],
        annotations,
      });
      continue;
    }

    // Standard task line
    const taskMatch = line.match(TASK_RE);
    if (taskMatch) {
      const indentChars = taskMatch[1].length;
      const depth = Math.floor(indentChars / 2);
      const status = taskMatch[2] as TaskStatus;
      const rest = taskMatch[3];

      const { resolution, rest: afterResolution } = extractResolution(rest);
      const { due, rest: afterDue } = extractDueDate(afterResolution);
      const { description, tags } = extractTags(afterDue);
      const annotations = collectAnnotations(lines, i, indentChars);

      flat.push({
        line: lineNum,
        indent: depth,
        status,
        description,
        resolution,
        due,
        tags,
        raw: line,
        children: [],
        annotations,
      });
    }
  }

  // Second pass: nest into tree using a stack
  return nestTasks(flat);
}

/** Build a tree from flat tasks using indent depth */
function nestTasks(flat: Task[]): Task[] {
  const roots: Task[] = [];
  // Stack tracks the "current path" — stack[0] is root, stack[1] is its child, etc.
  const stack: Task[] = [];

  for (const task of flat) {
    // Pop stack until we find the parent level
    while (stack.length > 0 && stack[stack.length - 1].indent >= task.indent) {
      stack.pop();
    }

    if (stack.length === 0) {
      // Top-level task
      roots.push(task);
    } else {
      // Child of whatever's on top of the stack
      stack[stack.length - 1].children.push(task);
    }

    stack.push(task);
  }

  return roots;
}

/** Collect HTML comment annotations on lines immediately following a task */
function collectAnnotations(lines: string[], taskIndex: number, taskIndent: number): Record<string, string> {
  const annotations: Record<string, string> = {};
  for (let j = taskIndex + 1; j < lines.length; j++) {
    const nextLine = lines[j];
    const annoMatch = nextLine.match(ANNOTATION_RE);
    if (annoMatch && annoMatch[1].length >= taskIndent) {
      annotations[annoMatch[2]] = annoMatch[3];
    } else {
      break;
    }
  }
  return annotations;
}
