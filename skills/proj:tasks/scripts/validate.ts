import type { ValidationError, ValidationResult } from "./types.ts";

const TASK_RE = /^(\s*)- \[([ x~@!?*]|@[^\]]*)\]\s+(.+)$/;
const LOOKS_LIKE_TASK_RE = /^(\s*)- \[/;

/**
 * Validate an mxit markdown file for format errors.
 * Returns errors for:
 * - Lines that look like tasks but don't match the regex
 * - Odd indentation (not a multiple of 2 spaces)
 * - Children without a parent
 */
export function validateFormat(markdown: string): ValidationResult {
  const lines = markdown.split("\n");
  const errors: ValidationError[] = [];
  let maxDepthSeen = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip non-task-looking lines
    if (!LOOKS_LIKE_TASK_RE.test(line)) continue;

    const match = line.match(TASK_RE);
    if (!match) {
      errors.push({
        line: lineNum,
        message: `Malformed task bracket — expected one of: [ ] [@] [x] [~] [?] [!] [*]`,
        raw: line,
      });
      continue;
    }

    const indent = match[1].length;
    const depth = Math.floor(indent / 2);

    // Check indentation is a multiple of 2
    if (indent % 2 !== 0) {
      errors.push({
        line: lineNum,
        message: `Odd indentation (${indent} spaces) — use multiples of 2`,
        raw: line,
      });
    }

    if (depth === 0) {
      maxDepthSeen = 0;
    } else {
      // Check for orphan — can't jump more than 1 level deeper than previous
      if (depth > maxDepthSeen + 1) {
        errors.push({
          line: lineNum,
          message: `Orphan subtask — indented to depth ${depth} but no parent at depth ${depth - 1}`,
          raw: line,
        });
      }
      maxDepthSeen = Math.max(maxDepthSeen, depth);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
