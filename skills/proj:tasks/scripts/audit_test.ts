import { assertEquals, assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { parseTasks } from "./parse.ts";
import { getReady } from "./ready.ts";
import { addDiscoveredTask, completeTask, failTask } from "./fileops.ts";

const names = (markdown: string, context = "") =>
  getReady(parseTasks(markdown), parseTasks(context)).map((t) => t.description);

Deno.test("bundled parser and readiness: needs pending, satisfied, missing and duplicate targets", () => {
  const target = "- [ ] Dashboard #needs:api";
  assertEquals(parseTasks(target)[0].tags, [{ name: "needs", value: "api" }]);
  for (const status of [" ", "@", "!", "?", "~", "*"]) {
    assertEquals(names(target, `- [${status}] API #api`), []);
  }
  assertEquals(names(target), []);
  assertEquals(names(target, "- [x] API #api"), ["Dashboard"]);
  assertEquals(names(target, "- [x] API #api\n- [ ] Other API #api"), []);
  assertEquals(names("- [x] API #api\n" + target), ["Dashboard"]);
  assertEquals(names(target, "- [x] Phase\n  - [x] API #api"), ["Dashboard"]);
  const context = parseTasks("- [x] Phase\n  - [x] API #api");
  assertEquals(getReady(parseTasks(target), [context[0], ...context[0].children]).map((t) => t.description), ["Dashboard"]);
  assertEquals(names("- [ ] Dashboard #needs:api #needs:design", "- [x] API #api"), []);
});

Deno.test("CLI fail enforces the runner's two-attempt limit through run recovery", async () => {
  const dir = await Deno.makeTempDir();
  try {
    await Deno.writeTextFile(`${dir}/TASKS.md`, "- [@agent] Failing\n- [ ] Other");
    const fail = ["fail", "TASKS.md", "1", "--error", "tests failed", "--max-retries", "2"];
    assertEquals((await runCli(dir, ...fail)).code, 0);
    assertEquals(JSON.parse((await runCli(dir, "ready", "TASKS.md", "--json")).out).length, 2);
    assertEquals((await runCli(dir, ...fail)).code, 0);
    const run = await runCli(dir, "run", "TASKS.md");
    assertEquals(run.code, 0);
    assertStringIncludes(run.out, "1 ready task:");
    assertStringIncludes(run.out, "Other");
    assertEquals(run.out.includes("Failing"), false);
    assertStringIncludes(await Deno.readTextFile(`${dir}/TASKS.md`), "#error=2");
    assertStringIncludes(await Deno.readTextFile(`${dir}/TASKS.md`), "#stuck");
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});

Deno.test("bundled readiness: ancestor gates hold descendants while ordinary parents allow child work", () => {
  for (const gate of ["#stuck", "#discovered", "#needs-approval", "#needs:missing", "#blocked-by:api"]) {
    assertEquals(names(`- [ ] Parent ${gate}\n  - [ ] Child\n    - [!] Grandchild\n- [ ] Unrelated`, "- [ ] API #api"), ["Unrelated"]);
  }
  assertEquals(names("- [ ] Parent\n  - [!] Child"), ["Child"]);
  assertEquals(names("- [ ] Parent #blocked-by:api\n  - [ ] Child", "- [x] API #api"), ["Child"]);
  assertEquals(names("- [ ] Parent #needs:api\n  - [ ] Child", "- [x] API #api"), ["Child"]);
  assertEquals(names("- [ ] Task #blocked-by:missing"), ["Task"]);
  assertEquals(names("- [?] Question\n- [*] Note\n- [~] Obsolete\n- [@agent] Claimed\n- [x] Done\n- [!] Retry #error=1"), ["Retry"]);
});

Deno.test("approval records permission separately from execution and dependent completion", () => {
  const dependent = "\n- [ ] Ship #needs:migration\n- [ ] Notify #blocked-by:migration";
  assertEquals(names("- [ ] Migrate #migration #needs-approval" + dependent), []);
  const approved = "- [ ] [approved: human sign-off] Migrate #migration";
  assertEquals(parseTasks(approved)[0].resolution, { keyword: "approved", message: "human sign-off" });
  assertEquals(names(approved + dependent), ["Migrate"]);
  assertEquals(names(approved + " #needs-approval" + dependent), []);
  assertEquals(names("- [x] [done: migration verified] Migrate #migration" + dependent), ["Ship", "Notify"]);
});

Deno.test("discovery writer produces held work; human review releases it", async () => {
  const file = await Deno.makeTempFile();
  try {
    await Deno.writeTextFile(file, "- [x] Original scope complete");
    await addDiscoveredTask(file, 1, "Follow-up");
    const content = await Deno.readTextFile(file);
    assertEquals(names(content), []);
    assertEquals(names(content.replace(" #discovered", "")), ["Follow-up"]);
  } finally {
    await Deno.remove(file);
  }
});

Deno.test("exhausted two-attempt retry remains held across reparsing and allows other work", async () => {
  const file = await Deno.makeTempFile();
  try {
    await Deno.writeTextFile(file, "- [!] Failing\n- [ ] Other");
    await failTask(file, 1, "tests failed", 2);
    assertEquals(names(await Deno.readTextFile(file)), ["Failing", "Other"]);
    await failTask(file, 1, "tests failed", 2);
    const content = await Deno.readTextFile(file);
    assertStringIncludes(content, "#error=2");
    assertStringIncludes(content, "#stuck");
    assertEquals(names(content), ["Other"]);
    assertEquals(names(content.replace("- [ ] Failing", "- [!] Failing")), ["Other"]);
    await completeTask(file, 1, "verified after intervention");
    assertEquals(parseTasks(await Deno.readTextFile(file))[0].status, "x");
  } finally {
    await Deno.remove(file);
  }
});

const cli = new URL("./cli.ts", import.meta.url).pathname;
async function runCli(cwd: string, ...args: string[]) {
  const result = await new Deno.Command(Deno.execPath(), {
    args: ["run", "--allow-read", "--allow-write", cli, ...args], cwd,
    stdout: "piped", stderr: "piped",
  }).output();
  return { code: result.code, out: new TextDecoder().decode(result.stdout), err: new TextDecoder().decode(result.stderr) };
}

Deno.test("CLI ready/run use only explicit dependency context and do not execute context tasks", async () => {
  const dir = await Deno.makeTempDir();
  try {
    await Deno.writeTextFile(`${dir}/TASKS.md`, "- [ ] Dashboard #needs:api #needs:design\n- [ ] Held #discovered\n  - [ ] Hidden child\n- [ ] Approval #needs-approval\n- [!] Exhausted #error=2 #stuck");
    const api = "- [x] API #api\n- [@other] Context work";
    await Deno.writeTextFile(`${dir}/API.md`, api);
    await Deno.writeTextFile(`${dir}/DESIGN.md`, "- [x] Design #design");
    assertEquals(JSON.parse((await runCli(dir, "ready", "TASKS.md", "--json")).out), []);
    const flags = ["--context", "API.md", "--context", "DESIGN.md"];
    const ready = await runCli(dir, "ready", "TASKS.md", "--json", ...flags);
    assertEquals(ready.code, 0);
    assertEquals(JSON.parse(ready.out).map((t: { description: string }) => t.description), ["Dashboard"]);
    const run = await runCli(dir, "run", "TASKS.md", ...flags);
    assertEquals(run.code, 0);
    assertStringIncludes(run.out, "1 ready task:");
    assertStringIncludes(run.out, "Dashboard");
    assertEquals(await Deno.readTextFile(`${dir}/API.md`), api);
    await Deno.writeTextFile(`${dir}/API.md`, "- [ ] API #api");
    assertEquals(JSON.parse((await runCli(dir, "ready", "TASKS.md", "--json", ...flags)).out), []);
    assertEquals((await runCli(dir, "ready", "TASKS.md", "--context")).code, 1);
    assertEquals((await runCli(dir, "ready", "TASKS.md", "--context", "absent.md")).code, 1);
  } finally {
    await Deno.remove(dir, { recursive: true });
  }
});
