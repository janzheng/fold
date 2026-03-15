import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { claimTask, completeTask, failTask, resetCrashed, addDiscoveredTask } from "./fileops.ts";
import { parseTasks } from "./parse.ts";

const FIXTURE = `# Test Tasks

- [ ] First task #bug
- [ ] Second task #feature
- [@] Third task in progress
- [!] Important task #auth
- [ ] Parent task
  - [ ] Child one
  - [ ] Child two
`;

async function withTempFile(content: string, fn: (path: string) => Promise<void>): Promise<void> {
  const tmp = await Deno.makeTempFile({ suffix: ".md" });
  await Deno.writeTextFile(tmp, content);
  try {
    await fn(tmp);
  } finally {
    await Deno.remove(tmp);
  }
}

async function readAndParse(path: string) {
  const content = await Deno.readTextFile(path);
  return { content, tasks: parseTasks(content) };
}

// --- claimTask ---

Deno.test("claimTask - sets [@agent-name]", async () => {
  await withTempFile(FIXTURE, async (path) => {
    await claimTask(path, 3, "claude-1");
    const { content } = await readAndParse(path);
    assertStringIncludes(content, "- [@claude-1] First task #bug");
  });
});

Deno.test("claimTask - preserves tags and description", async () => {
  await withTempFile(FIXTURE, async (path) => {
    await claimTask(path, 4, "codex-2");
    const { tasks } = await readAndParse(path);
    const claimed = tasks.find(t => t.agent === "codex-2");
    assertEquals(claimed?.tags.some(t => t.name === "feature"), true);
  });
});

// --- completeTask ---

Deno.test("completeTask - sets [x] with resolution", async () => {
  await withTempFile(FIXTURE, async (path) => {
    await completeTask(path, 3, "fixed the bug");
    const { content } = await readAndParse(path);
    assertStringIncludes(content, "- [x] [done: fixed the bug]");
    assertStringIncludes(content, "First task #bug");
  });
});

Deno.test("completeTask - works without result message", async () => {
  await withTempFile(FIXTURE, async (path) => {
    await completeTask(path, 3);
    const { content } = await readAndParse(path);
    assertStringIncludes(content, "- [x] First task #bug");
  });
});

Deno.test("completeTask - removes #error and #stuck tags", async () => {
  const md = `- [ ] Fix the bug #error=2 #error="timeout" #stuck`;
  await withTempFile(md, async (path) => {
    await completeTask(path, 1, "resolved");
    const content = await Deno.readTextFile(path);
    assertEquals(content.includes("#error"), false);
    assertEquals(content.includes("#stuck"), false);
    assertStringIncludes(content, "[x]");
  });
});

// --- failTask ---

Deno.test("failTask - adds #error=1 on first failure", async () => {
  await withTempFile(FIXTURE, async (path) => {
    await failTask(path, 3, "timeout after 30s");
    const content = await Deno.readTextFile(path);
    assertStringIncludes(content, "- [ ]"); // reset to open
    assertStringIncludes(content, '#error=1');
    assertStringIncludes(content, '#error="timeout after 30s"');
  });
});

Deno.test("failTask - increments error count", async () => {
  const md = `- [ ] Fix the bug #error=2`;
  await withTempFile(md, async (path) => {
    await failTask(path, 1, "still broken");
    const content = await Deno.readTextFile(path);
    assertStringIncludes(content, "#error=3");
    assertStringIncludes(content, "#stuck"); // hits default max of 3
  });
});

Deno.test("failTask - adds #stuck at maxRetries", async () => {
  const md = `- [@agent] Do the thing`;
  await withTempFile(md, async (path) => {
    await failTask(path, 1, "fail 1", 2);
    let content = await Deno.readTextFile(path);
    assertEquals(content.includes("#stuck"), false);

    await failTask(path, 1, "fail 2", 2);
    content = await Deno.readTextFile(path);
    assertStringIncludes(content, "#stuck");
    assertStringIncludes(content, "#error=2");
  });
});

// --- resetCrashed ---

Deno.test("resetCrashed - resets all [@] to [ ]", async () => {
  const md = `- [@claude-1] Task one
- [ ] Task two
- [@] Task three
- [x] Task four`;
  await withTempFile(md, async (path) => {
    const count = await resetCrashed(path);
    assertEquals(count, 2);
    const content = await Deno.readTextFile(path);
    assertEquals(content.includes("[@"), false);
    assertStringIncludes(content, "- [ ] Task one");
    assertStringIncludes(content, "- [ ] Task three");
    assertStringIncludes(content, "- [x] Task four");
  });
});

Deno.test("resetCrashed - returns 0 when nothing to reset", async () => {
  const md = `- [ ] Task one
- [x] Task two`;
  await withTempFile(md, async (path) => {
    const count = await resetCrashed(path);
    assertEquals(count, 0);
  });
});

// --- addDiscoveredTask ---

Deno.test("addDiscoveredTask - adds child with #discovered", async () => {
  await withTempFile(FIXTURE, async (path) => {
    await addDiscoveredTask(path, 3, "Found a new bug", ["bug"]);
    const content = await Deno.readTextFile(path);
    assertStringIncludes(content, "  - [ ] Found a new bug #bug #discovered");
  });
});

Deno.test("addDiscoveredTask - inserts after existing children", async () => {
  await withTempFile(FIXTURE, async (path) => {
    // Parent task is at line 7, has children at lines 8 and 9
    await addDiscoveredTask(path, 7, "New subtask");
    const lines = (await Deno.readTextFile(path)).split("\n");
    // Should be inserted after the last child (line 9 = index 8)
    const insertedIdx = lines.findIndex(l => l.includes("New subtask"));
    assertEquals(insertedIdx, 9); // after Child two (index 8)
    assertStringIncludes(lines[insertedIdx], "#discovered");
  });
});

Deno.test("addDiscoveredTask - inserts after annotations", async () => {
  const md = `- [ ] Task with annotation
  <!-- test: deno test foo.ts -->
- [ ] Next task`;
  await withTempFile(md, async (path) => {
    await addDiscoveredTask(path, 1, "Side issue");
    const lines = (await Deno.readTextFile(path)).split("\n");
    assertEquals(lines[0], "- [ ] Task with annotation");
    assertEquals(lines[1], "  <!-- test: deno test foo.ts -->");
    assertStringIncludes(lines[2], "Side issue");
    assertEquals(lines[3], "- [ ] Next task");
  });
});
