import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { getReady } from "./ready.ts";
import { parseTasks } from "./parse.ts";
import { completeTask, addTask } from "./fileops.ts";

// --- blocked-by cascade ---

Deno.test("getReady - blocked-by cascades to children", () => {
  const md = `- [ ] First task #auth
- [ ] Blocked parent #blocked-by:auth
  - [ ] Child of blocked parent
  - [ ] Another child`;
  const tasks = parseTasks(md);
  const ready = getReady(tasks);
  // Only "First task" should be ready — parent is blocked, children inherit the block
  assertEquals(ready.length, 1);
  assertEquals(ready[0].description, "First task");
});

Deno.test("getReady - blocked-by cascade unblocks when resolved", () => {
  const md = `- [x] First task #auth
- [ ] Unblocked parent #blocked-by:auth
  - [ ] Child one
  - [ ] Child two`;
  const tasks = parseTasks(md);
  const ready = getReady(tasks);
  // auth is done, so parent is unblocked. But parent has pending children,
  // so parent is not ready — children ARE ready
  const descriptions = ready.map(t => t.description);
  assertEquals(descriptions.includes("Child one"), true);
  assertEquals(descriptions.includes("Child two"), true);
  assertEquals(descriptions.includes("Unblocked parent"), false);
});

Deno.test("getReady - deep blocked-by cascade", () => {
  const md = `- [ ] Blocker #release
- [ ] Phase 3 #blocked-by:release
  - [ ] Subtask A
    - [ ] Grandchild A1`;
  const tasks = parseTasks(md);
  const ready = getReady(tasks);
  // Only the blocker should be ready
  assertEquals(ready.length, 1);
  assertEquals(ready[0].description, "Blocker");
});

// --- completeTask: no duplicate resolution ---

Deno.test("completeTask - replaces existing resolution on re-complete", async () => {
  const md = `- [x] [done: first result] Task #bug`;
  const tmp = await Deno.makeTempFile({ suffix: ".md" });
  await Deno.writeTextFile(tmp, md);
  try {
    await completeTask(tmp, 1, "second result");
    const content = await Deno.readTextFile(tmp);
    // Should have exactly one resolution bracket
    const matches = content.match(/\[done:/g);
    assertEquals(matches?.length, 1);
    assertEquals(content.includes("[done: second result]"), true);
    assertEquals(content.includes("[done: first result]"), false);
  } finally {
    await Deno.remove(tmp);
  }
});

// --- addTask ---

Deno.test("addTask - adds task to file", async () => {
  const md = `# Tasks\n\n- [ ] Existing task #bug`;
  const tmp = await Deno.makeTempFile({ suffix: ".md" });
  await Deno.writeTextFile(tmp, md);
  try {
    const lineNum = await addTask(tmp, "New task from CLI", ["api", "feature"]);
    const content = await Deno.readTextFile(tmp);
    assertEquals(content.includes("- [ ] New task from CLI #api #feature"), true);
    assertEquals(lineNum > 0, true);
  } finally {
    await Deno.remove(tmp);
  }
});

Deno.test("addTask - works on empty file", async () => {
  const tmp = await Deno.makeTempFile({ suffix: ".md" });
  await Deno.writeTextFile(tmp, "");
  try {
    await addTask(tmp, "First task");
    const content = await Deno.readTextFile(tmp);
    assertEquals(content.includes("- [ ] First task"), true);
  } finally {
    await Deno.remove(tmp);
  }
});
