import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { parseTasks } from "./parse.ts";
import { serializeTasks, applyTasks } from "./serialize.ts";
import { getReady } from "./ready.ts";
import { validateFormat } from "./validate.ts";

const EXAMPLE = `# Auth Refactor

## Core

- [x] [done: extracted to auth/validation.ts] Extract token validation #auth #refactor
- [@claude-1] Add refresh token support #auth #feature
  - [x] [done: designed rotation strategy] Design token rotation strategy
  - [@] Implement rotation endpoint
  - [ ] Handle edge case: expired refresh token
    <!-- test: deno test auth/refresh_test.ts -->
- [ ] Write integration tests #auth #test
  <!-- test: deno test auth/ -->
  <!-- timeout: 10m -->
- [!] Fix race condition #auth #bug #error="test timeout after 30s"
- [ ] Migrate legacy session tokens #auth #migration #error=3 #stuck
- [?] Should we support token rotation? #auth
- [*] Nice article about refresh tokens #reference
- [~] [deferred: moving to Q3] Consider OAuth2 PKCE flow`;

Deno.test("parseTasks - parses all 7 status types", () => {
  const tasks = parseTasks(EXAMPLE);
  const statuses = tasks.map((t) => t.status);
  assertEquals(statuses, ["x", "@", " ", "!", " ", "?", "*", "~"]);
});

Deno.test("parseTasks - extracts agent name from [@agent]", () => {
  const tasks = parseTasks(EXAMPLE);
  const agentTask = tasks.find((t) => t.status === "@");
  assertEquals(agentTask?.agent, "claude-1");
});

Deno.test("parseTasks - extracts resolution brackets", () => {
  const tasks = parseTasks(EXAMPLE);
  assertEquals(tasks[0].resolution?.keyword, "done");
  assertEquals(tasks[0].resolution?.message, "extracted to auth/validation.ts");
  assertEquals(tasks[7].resolution?.keyword, "deferred");
});

Deno.test("parseTasks - extracts tags with values", () => {
  const tasks = parseTasks(EXAMPLE);
  const errorTask = tasks[3]; // [!] Fix race condition
  const errorTag = errorTask.tags.find((t) => t.name === "error");
  assertEquals(errorTag?.value, "test timeout after 30s");

  const stuckTask = tasks[4]; // Migrate legacy
  const errorCount = stuckTask.tags.find((t) => t.name === "error");
  assertEquals(errorCount?.value, 3);
  const stuck = stuckTask.tags.find((t) => t.name === "stuck");
  assertEquals(stuck?.name, "stuck");
});

Deno.test("parseTasks - parses children", () => {
  const tasks = parseTasks(EXAMPLE);
  const parent = tasks[1]; // [@claude-1] Add refresh token
  assertEquals(parent.children.length, 3);
  assertEquals(parent.children[0].status, "x");
  assertEquals(parent.children[1].status, "@");
  assertEquals(parent.children[2].status, " ");
});

Deno.test("parseTasks - collects annotations", () => {
  const tasks = parseTasks(EXAMPLE);
  const child = tasks[1].children[2]; // Handle edge case
  assertEquals(child.annotations["test"], "deno test auth/refresh_test.ts");

  const testTask = tasks[2]; // Write integration tests
  assertEquals(testTask.annotations["test"], "deno test auth/");
  assertEquals(testTask.annotations["timeout"], "10m");
});

Deno.test("getReady - filters for actionable tasks", () => {
  const tasks = parseTasks(EXAMPLE);
  const ready = getReady(tasks);
  // [!] Fix race condition is ready (important + #error but not #stuck)
  // [ ] Write integration tests is ready (no children, no blocking)
  // [ ] Migrate legacy is NOT ready (#stuck)
  // [@claude-1] is NOT ready (ongoing)
  // [x], [~], [?], [*] are NOT ready
  const descriptions = ready.map((t) => t.description);
  assertEquals(descriptions.includes("Write integration tests"), true);
  assertEquals(descriptions.includes("Fix race condition"), true);
  assertEquals(descriptions.includes("Migrate legacy session tokens"), false);
});

Deno.test("getReady - parent with pending children is not ready but children are", () => {
  const md = `- [ ] Parent
  - [ ] Child 1
  - [ ] Child 2`;
  const tasks = parseTasks(md);
  const ready = getReady(tasks);
  // Parent is not ready (has pending children), but children ARE ready
  const descriptions = ready.map(t => t.description);
  assertEquals(descriptions.includes("Parent"), false);
  assertEquals(descriptions.includes("Child 1"), true);
  assertEquals(descriptions.includes("Child 2"), true);
  assertEquals(ready.length, 2);
});

Deno.test("validateFormat - catches malformed brackets", () => {
  const md = `- [ ] Good task
- [Z] Bad bracket
- [!!] Old stuck syntax`;
  const result = validateFormat(md);
  assertEquals(result.valid, false);
  assertEquals(result.errors.length, 2);
  assertEquals(result.errors[0].line, 2);
  assertEquals(result.errors[1].line, 3);
});

Deno.test("validateFormat - valid file passes", () => {
  const result = validateFormat(EXAMPLE);
  assertEquals(result.valid, true);
});

Deno.test("parseTasks - parses #blocked-by:value tags", () => {
  const md = `- [ ] Deploy new endpoint #blocked-by:auth-refactor`;
  const tasks = parseTasks(md);
  const blockedTag = tasks[0].tags.find(t => t.name === "blocked-by");
  assertEquals(blockedTag?.value, "auth-refactor");
});

Deno.test("getReady - blocked-by prevents readiness", () => {
  const md = `- [ ] First task #auth-refactor
- [ ] Second task #blocked-by:auth-refactor`;
  const tasks = parseTasks(md);
  const ready = getReady(tasks);
  // First is ready, second is blocked by auth-refactor (which is an open tag)
  assertEquals(ready.length, 1);
  assertEquals(ready[0].description, "First task");
});

Deno.test("getReady - blocked-by unblocks when blocker is done", () => {
  const md = `- [x] First task #auth-refactor
- [ ] Second task #blocked-by:auth-refactor`;
  const tasks = parseTasks(md);
  const ready = getReady(tasks);
  // First is done, so auth-refactor is no longer an open tag
  assertEquals(ready.length, 1);
  assertEquals(ready[0].description, "Second task");
});

Deno.test("serializeTasks - round-trips simple tasks", () => {
  const md = `- [ ] First task #bug
- [x] [done: fixed it] Second task #feature
- [@claude-1] Third task #wip`;
  const tasks = parseTasks(md);
  const output = serializeTasks(tasks);
  // Re-parse and compare structure
  const reparsed = parseTasks(output);
  assertEquals(reparsed.length, 3);
  assertEquals(reparsed[0].status, " ");
  assertEquals(reparsed[1].resolution?.keyword, "done");
  assertEquals(reparsed[2].agent, "claude-1");
});

Deno.test("applyTasks - preserves headings and blank lines", () => {
  const md = `# My Project

## Tasks

- [ ] First task #bug
- [ ] Second task #feature

## Notes

Some notes here.`;

  const tasks = parseTasks(md);
  // Modify a task
  tasks[0].status = "x";
  tasks[0].resolution = { keyword: "fixed", message: "done" };

  const result = applyTasks(md, tasks);
  const lines = result.split("\n");

  // Non-task lines preserved
  assertEquals(lines[0], "# My Project");
  assertEquals(lines[1], "");
  assertEquals(lines[2], "## Tasks");
  assertEquals(lines[3], "");
  // Task was updated
  assertEquals(lines[4].includes("[x]"), true);
  assertEquals(lines[4].includes("[fixed: done]"), true);
  // Rest preserved
  assertEquals(lines[6], "");
  assertEquals(lines[7], "## Notes");
  assertEquals(lines[9], "Some notes here.");
});

Deno.test("applyTasks - preserves annotations", () => {
  const md = `- [ ] Task with annotation
  <!-- test: deno test foo.ts -->
  <!-- timeout: 5m -->
- [ ] Next task`;

  const tasks = parseTasks(md);
  tasks[0].status = "x";

  const result = applyTasks(md, tasks);
  const lines = result.split("\n");

  assertEquals(lines[0].includes("[x]"), true);
  assertEquals(lines[1].includes("<!-- test:"), true);
  assertEquals(lines[2].includes("<!-- timeout:"), true);
  assertEquals(lines[3], "- [ ] Next task");
});

// --- Unlimited nesting ---

Deno.test("parseTasks - handles deep nesting (3+ levels)", () => {
  const md = `- [ ] Level 0
  - [ ] Level 1
    - [ ] Level 2
      - [ ] Level 3
        - [ ] Level 4`;
  const tasks = parseTasks(md);
  assertEquals(tasks.length, 1);
  assertEquals(tasks[0].children.length, 1);
  assertEquals(tasks[0].children[0].children.length, 1);
  assertEquals(tasks[0].children[0].children[0].children.length, 1);
  assertEquals(tasks[0].children[0].children[0].children[0].children.length, 1);
  assertEquals(tasks[0].children[0].children[0].children[0].children[0].description, "Level 4");
});

Deno.test("parseTasks - indent depth is correct", () => {
  const md = `- [ ] Root
  - [ ] Child
    - [ ] Grandchild`;
  const tasks = parseTasks(md);
  assertEquals(tasks[0].indent, 0);
  assertEquals(tasks[0].children[0].indent, 1);
  assertEquals(tasks[0].children[0].children[0].indent, 2);
});

Deno.test("parseTasks - siblings at same depth", () => {
  const md = `- [ ] Parent
  - [ ] Child A
    - [ ] Grandchild A1
    - [ ] Grandchild A2
  - [ ] Child B`;
  const tasks = parseTasks(md);
  assertEquals(tasks[0].children.length, 2); // Child A and Child B
  assertEquals(tasks[0].children[0].children.length, 2); // A1 and A2
  assertEquals(tasks[0].children[1].description, "Child B");
  assertEquals(tasks[0].children[1].children.length, 0);
});

Deno.test("serializeTasks - round-trips deep nesting", () => {
  const md = `- [ ] L0
  - [ ] L1
    - [ ] L2
      - [ ] L3`;
  const tasks = parseTasks(md);
  const output = serializeTasks(tasks);
  const reparsed = parseTasks(output);
  assertEquals(reparsed[0].children[0].children[0].children[0].description, "L3");
});

Deno.test("validateFormat - allows unlimited nesting", () => {
  const md = `- [ ] L0
  - [ ] L1
    - [ ] L2
      - [ ] L3
        - [ ] L4`;
  const result = validateFormat(md);
  assertEquals(result.valid, true);
});

Deno.test("validateFormat - catches odd indentation", () => {
  const md = `- [ ] Good
   - [ ] Three spaces`;
  const result = validateFormat(md);
  assertEquals(result.valid, false);
  assertEquals(result.errors[0].message.includes("Odd indentation"), true);
});

// --- Due dates ---

Deno.test("parseTasks - extracts due date (full date)", () => {
  const md = `- [ ] Ship the feature -> 2026-03-31`;
  const tasks = parseTasks(md);
  assertEquals(tasks[0].due?.raw, "2026-03-31");
  assertEquals(tasks[0].due?.date.getFullYear(), 2026);
  assertEquals(tasks[0].due?.date.getMonth(), 2); // March = 2
  assertEquals(tasks[0].due?.date.getDate(), 31);
  assertEquals(tasks[0].description, "Ship the feature");
});

Deno.test("parseTasks - extracts due date (quarter)", () => {
  const md = `- [ ] Finish this quarter -> 2026-Q2`;
  const tasks = parseTasks(md);
  assertEquals(tasks[0].due?.raw, "2026-Q2");
  // Q2 ends June 30
  assertEquals(tasks[0].due?.date.getMonth(), 5); // June = 5
  assertEquals(tasks[0].due?.date.getDate(), 30);
});

Deno.test("parseTasks - extracts due date (year)", () => {
  const md = `- [ ] Some time this year -> 2026`;
  const tasks = parseTasks(md);
  assertEquals(tasks[0].due?.raw, "2026");
  assertEquals(tasks[0].due?.date.getMonth(), 11); // Dec
  assertEquals(tasks[0].due?.date.getDate(), 31);
});

Deno.test("parseTasks - extracts due date (month)", () => {
  const md = `- [ ] End of March -> 2026-03`;
  const tasks = parseTasks(md);
  assertEquals(tasks[0].due?.raw, "2026-03");
  assertEquals(tasks[0].due?.date.getMonth(), 2); // March
  assertEquals(tasks[0].due?.date.getDate(), 31);
});

Deno.test("parseTasks - extracts due date (week)", () => {
  const md = `- [ ] This week -> 2026-W12`;
  const tasks = parseTasks(md);
  assertEquals(tasks[0].due?.raw, "2026-W12");
  assertEquals(tasks[0].due?.date instanceof Date, true);
});

Deno.test("parseTasks - due date with tags", () => {
  const md = `- [ ] Ship it #feature -> 2026-03-31`;
  const tasks = parseTasks(md);
  assertEquals(tasks[0].due?.raw, "2026-03-31");
  assertEquals(tasks[0].tags[0].name, "feature");
  assertEquals(tasks[0].description, "Ship it");
});

Deno.test("parseTasks - no due date when absent", () => {
  const md = `- [ ] No date here #tag`;
  const tasks = parseTasks(md);
  assertEquals(tasks[0].due, undefined);
});

Deno.test("serializeTasks - round-trips due dates", () => {
  const md = `- [ ] Ship it #feature -> 2026-03-31`;
  const tasks = parseTasks(md);
  const output = serializeTasks(tasks);
  const reparsed = parseTasks(output);
  assertEquals(reparsed[0].due?.raw, "2026-03-31");
});
