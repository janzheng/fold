/** mxit task status — the 7 xit! checkbox states */
export type TaskStatus =
  | " "  // open — not started
  | "@"  // ongoing — in progress
  | "x"  // done — completed
  | "~"  // obsolete — no longer relevant
  | "?"  // in question — needs discussion
  | "!"  // important — needs attention
  | "*"; // starred — flagged / noted

/** Tag with optional value: #error, #error=3, #error="timeout" */
export interface Tag {
  name: string;
  value?: string | number;
}

/** Resolution bracket: [fixed: rewrote validation] */
export interface Resolution {
  keyword: string;
  message: string;
}

/** Due date parsed from -> pattern */
export interface DueDate {
  /** Raw string as written: "2026-03-31", "2026-Q2", "2026-W12", etc. */
  raw: string;
  /** Resolved to a concrete Date (last day of period for ranges) */
  date: Date;
}

/** A single mxit task */
export interface Task {
  /** Line number in the source file (1-based) */
  line: number;
  /** Indentation depth (0 = top-level, 1 = first child, 2 = grandchild, etc.) */
  indent: number;
  /** Checkbox status character */
  status: TaskStatus;
  /** Task description (after status, before tags) */
  description: string;
  /** Resolution bracket, if present */
  resolution?: Resolution;
  /** Due date from -> pattern, if present */
  due?: DueDate;
  /** Parsed tags */
  tags: Tag[];
  /** Agent name if status is @ and name is present: [@claude-1] */
  agent?: string;
  /** Raw full line text */
  raw: string;
  /** Child tasks (unlimited nesting) */
  children: Task[];
  /** HTML comment annotations below this task */
  annotations: Record<string, string>;
}

/** Result of validateFormat() */
export interface ValidationError {
  line: number;
  message: string;
  raw: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}
