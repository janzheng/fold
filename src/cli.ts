import { parseTasks } from "./parse.ts";
import { getReady } from "./ready.ts";
import { validateFormat } from "./validate.ts";
import { claimTask, completeTask, failTask, resetCrashed, addDiscoveredTask, addTask } from "./fileops.ts";
import type { Task, Tag } from "./types.ts";

const HELP = `mxit — markdown-native task management

Usage: mxit <command> <file> [options]

Commands:
  list     <file> [filters] [--json]     List tasks (all or filtered)
  ready    <file> [filters] [--json]     Show ready (actionable) tasks
  status   <file>                         Show project summary
  add      <file> <title> [--tag <t>]... Add a new task
  claim    <file> <line> --agent <name>   Claim a task for an agent
  done     <file> <line> [--result <msg>] Mark task complete
  fail     <file> <line> --error <msg>    Mark task failed
  validate <file>                         Check format for errors
  recover  <file>                         Reset crashed [@] tasks to [ ]
  check    <file>                         Recover crashed, show ready + overdue

Filters (for list/ready):
  --tag <name>       Only tasks with this tag (repeatable)
  --agent <name>     Only tasks claimed by this agent
  --status <s>       Only tasks with this status (open,done,ongoing,important,...)
  --overdue          Only tasks past their due date

Options:
  --dry-run          Preview mutations without writing (claim/done/fail/add)
  --json             Output as JSON (list/ready)

States: [ ] open, [@] ongoing, [x] done, [~] obsolete, [?] question, [!] important, [*] starred
Tags:   #error, #error=N, #stuck, #blocked-by:tag, #discovered
`;

const KNOWN_FLAGS = new Set([
  "--help", "-h", "--json", "--tag", "--agent", "--status",
  "--overdue", "--error", "--result", "--max-retries", "--dry-run",
]);

const COMMANDS = new Set([
  "list", "ready", "status", "add", "claim", "done", "fail",
  "validate", "recover", "check", "run", "help",
]);

const STATUS_MAP: Record<string, string> = {
  open: " ", done: "x", ongoing: "@", obsolete: "~",
  question: "?", important: "!", starred: "*",
};

function die(msg: string): never {
  console.error(`error: ${msg}`);
  Deno.exit(1);
}

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

function getAllArgs(args: string[], flag: string): string[] {
  const values: string[] = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag && i + 1 < args.length) {
      values.push(args[i + 1]);
      i++; // skip value
    }
  }
  return values;
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

/** Check for unknown flags and die if found */
function checkUnknownFlags(args: string[]): void {
  for (const arg of args) {
    if (arg.startsWith("--") || (arg.startsWith("-") && arg.length === 2 && arg !== "-h")) {
      if (!KNOWN_FLAGS.has(arg)) {
        die(`unknown flag: ${arg}. Run 'mxit --help' for usage.`);
      }
    }
  }
}

/** Format a tag for display, including its value */
function formatTag(tag: Tag): string {
  if (tag.value === undefined) return `#${tag.name}`;
  if (tag.name === "blocked-by" && typeof tag.value === "string") {
    return `#${tag.name}:${tag.value}`;
  }
  if (typeof tag.value === "string") return `#${tag.name}="${tag.value}"`;
  return `#${tag.name}=${tag.value}`;
}

/** Format due date for display, with overdue indicator */
function formatDue(task: Task): string {
  if (!task.due) return "";
  const now = new Date();
  const overdue = task.due.date < now && task.status !== "x" && task.status !== "~";
  return overdue ? ` -> ${task.due.raw} [OVERDUE]` : ` -> ${task.due.raw}`;
}

/** Format a single task line for human display */
function formatTaskLine(t: Task): string {
  const marker = t.status === "@"
    ? (t.agent ? `[@${t.agent}]` : `[@]`)
    : `[${t.status}]`;
  const tags = t.tags.length > 0 ? " " + t.tags.map(formatTag).join(" ") : "";
  const due = formatDue(t);
  const resolution = t.resolution ? ` [${t.resolution.keyword}: ${t.resolution.message}]` : "";
  return `  L${t.line}  ${marker}${resolution} ${t.description}${tags}${due}`;
}

/** Flatten all tasks (including children) into a single array */
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

/** Apply filters to a task list */
function applyFilters(tasks: Task[], args: string[]): Task[] {
  let result = tasks;

  const tagFilters = getAllArgs(args, "--tag");
  if (tagFilters.length > 0) {
    result = result.filter(t =>
      tagFilters.every(tf => t.tags.some(tag => tag.name === tf))
    );
  }

  const agentFilter = getArg(args, "--agent");
  if (agentFilter) {
    result = result.filter(t => t.agent === agentFilter);
  }

  const statusFilter = getArg(args, "--status");
  if (statusFilter) {
    const statusChar = STATUS_MAP[statusFilter] ?? statusFilter;
    result = result.filter(t => t.status === statusChar);
  }

  if (hasFlag(args, "--overdue")) {
    const now = new Date();
    result = result.filter(t =>
      t.due && t.due.date < now && t.status !== "x" && t.status !== "~"
    );
  }

  return result;
}

/** Serialize a task for JSON output */
function taskToJson(t: Task) {
  return {
    line: t.line,
    status: t.status,
    description: t.description,
    tags: t.tags,
    agent: t.agent,
    due: t.due ? { raw: t.due.raw, date: t.due.date.toISOString() } : undefined,
    resolution: t.resolution,
    annotations: t.annotations,
  };
}

/** Get a line from a file for preview (dry-run) */
async function getLinePreview(file: string, lineNum: number): Promise<string> {
  const content = await readFile(file);
  const lines = content.split("\n");
  const idx = lineNum - 1;
  if (idx < 0 || idx >= lines.length) return `(line ${lineNum} out of range)`;
  return lines[idx].trim();
}

async function readFile(file: string): Promise<string> {
  try {
    return await Deno.readTextFile(file);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      die(`file not found: ${file}`);
    }
    throw e;
  }
}

async function main() {
  const args = Deno.args;

  if (args.length === 0 || hasFlag(args, "--help") || hasFlag(args, "-h")) {
    console.log(HELP);
    Deno.exit(0);
  }

  const command = args[0];
  const file = args[1];

  if (!COMMANDS.has(command)) {
    die(`unknown command: ${command}. Run 'mxit --help' for usage.`);
  }

  if (!file && command !== "help") {
    die(`missing file argument. Usage: mxit ${command} <file>`);
  }

  // Check for unknown flags (skip command and file positionals)
  checkUnknownFlags(args.slice(2));

  const dryRun = hasFlag(args, "--dry-run");

  try {
    switch (command) {
      case "list": {
        const content = await readFile(file);
        const tasks = parseTasks(content);
        const flat = flattenTasks(tasks);
        const filtered = applyFilters(flat, args);

        if (hasFlag(args, "--json")) {
          console.log(JSON.stringify(filtered.map(taskToJson), null, 2));
        } else {
          if (filtered.length === 0) {
            console.log("No tasks match the filters.");
          } else {
            for (const t of filtered) {
              console.log(formatTaskLine(t));
            }
            console.log(`\n${filtered.length} task${filtered.length === 1 ? "" : "s"}`);
          }
        }
        break;
      }

      case "ready": {
        const content = await readFile(file);
        const tasks = parseTasks(content);
        const ready = getReady(tasks);
        const filtered = applyFilters(ready, args);

        if (hasFlag(args, "--json")) {
          console.log(JSON.stringify(filtered.map(taskToJson), null, 2));
        } else {
          if (filtered.length === 0) {
            console.log("No ready tasks.");
          } else {
            for (const t of filtered) {
              console.log(formatTaskLine(t));
            }
          }
        }
        break;
      }

      case "status": {
        const content = await readFile(file);
        const tasks = parseTasks(content);
        const flat = flattenTasks(tasks);
        const ready = getReady(tasks);
        const now = new Date();

        // Collect tags that are still on open tasks
        const openTags = new Set<string>();
        for (const t of flat) {
          if (t.status === " " || t.status === "@" || t.status === "!") {
            for (const tag of t.tags) openTags.add(tag.name);
          }
        }

        const counts = {
          total: flat.length,
          open: flat.filter(t => t.status === " ").length,
          ongoing: flat.filter(t => t.status === "@").length,
          done: flat.filter(t => t.status === "x").length,
          important: flat.filter(t => t.status === "!").length,
          stuck: flat.filter(t => t.tags.some(tag => tag.name === "stuck")).length,
          blocked: flat.filter(t =>
            t.tags.some(tag =>
              tag.name === "blocked-by" &&
              typeof tag.value === "string" &&
              openTags.has(tag.value)
            )
          ).length,
          overdue: flat.filter(t =>
            t.due && t.due.date < now && t.status !== "x" && t.status !== "~"
          ).length,
          ready: ready.length,
        };

        const pct = counts.total > 0
          ? Math.round((counts.done / counts.total) * 100)
          : 0;

        console.log(`${file}`);
        console.log(`${"=".repeat(file.length)}`);
        console.log(`${counts.done}/${counts.total} done (${pct}%)`);
        console.log(``);
        console.log(`  open:      ${counts.open}`);
        console.log(`  ongoing:   ${counts.ongoing}`);
        console.log(`  done:      ${counts.done}`);
        console.log(`  important: ${counts.important}`);
        console.log(`  ready:     ${counts.ready}`);
        if (counts.stuck > 0)  console.log(`  stuck:     ${counts.stuck}`);
        if (counts.blocked > 0) console.log(`  blocked:   ${counts.blocked}`);
        if (counts.overdue > 0) console.log(`  OVERDUE:   ${counts.overdue}`);

        // Show overdue tasks if any
        if (counts.overdue > 0) {
          console.log(`\nOverdue:`);
          for (const t of flat) {
            if (t.due && t.due.date < now && t.status !== "x" && t.status !== "~") {
              console.log(formatTaskLine(t));
            }
          }
        }

        break;
      }

      case "add": {
        const title = args[2];
        if (!title) die("missing title. Usage: mxit add <file> <title> [--tag <t>]...");
        const tags = getAllArgs(args, "--tag");
        if (dryRun) {
          const tagStr = tags.length > 0 ? " " + tags.map(t => `#${t}`).join(" ") : "";
          console.log(`[dry-run] would add: - [ ] ${title}${tagStr}`);
          break;
        }
        const lineNum = await addTask(file, title, tags);
        console.log(`Added L${lineNum}: ${title}`);
        break;
      }

      case "claim": {
        const lineStr = args[2];
        const agent = getArg(args, "--agent");
        if (!lineStr) die("missing line number. Usage: mxit claim <file> <line> --agent <name>");
        if (!agent) die("missing --agent flag. Usage: mxit claim <file> <line> --agent <name>");
        const line = parseInt(lineStr);
        if (isNaN(line)) die(`invalid line number: ${lineStr}`);
        if (dryRun) {
          const taskLine = await getLinePreview(file, line);
          console.log(`[dry-run] would claim L${line} for ${agent}:`);
          console.log(`  ${taskLine}`);
          break;
        }
        await claimTask(file, line, agent);
        console.log(`Claimed L${line} for ${agent}`);
        break;
      }

      case "done": {
        const lineStr = args[2];
        if (!lineStr) die("missing line number. Usage: mxit done <file> <line> [--result <msg>]");
        const line = parseInt(lineStr);
        if (isNaN(line)) die(`invalid line number: ${lineStr}`);
        const result = getArg(args, "--result");
        if (dryRun) {
          const taskLine = await getLinePreview(file, line);
          console.log(`[dry-run] would complete L${line}${result ? `: ${result}` : ""}:`);
          console.log(`  ${taskLine}`);
          break;
        }
        await completeTask(file, line, result);
        console.log(`Completed L${line}${result ? `: ${result}` : ""}`);
        break;
      }

      case "fail": {
        const lineStr = args[2];
        const error = getArg(args, "--error");
        if (!lineStr) die("missing line number. Usage: mxit fail <file> <line> --error <msg>");
        if (!error) die("missing --error flag. Usage: mxit fail <file> <line> --error <msg>");
        const line = parseInt(lineStr);
        if (isNaN(line)) die(`invalid line number: ${lineStr}`);
        const maxRetries = parseInt(getArg(args, "--max-retries") ?? "3");
        if (dryRun) {
          const taskLine = await getLinePreview(file, line);
          console.log(`[dry-run] would fail L${line}: ${error}`);
          console.log(`  ${taskLine}`);
          break;
        }
        await failTask(file, line, error, maxRetries);
        console.log(`Failed L${line}: ${error}`);
        break;
      }

      case "validate": {
        const content = await readFile(file);
        const result = validateFormat(content);
        if (result.valid) {
          console.log("Valid ✓");
        } else {
          for (const err of result.errors) {
            console.error(`  L${err.line}: ${err.message}`);
            console.error(`    ${err.raw.trim()}`);
          }
          Deno.exit(1);
        }
        break;
      }

      case "recover": {
        const count = await resetCrashed(file);
        console.log(`Recovered ${count} crashed task${count === 1 ? "" : "s"}`);
        break;
      }

      case "run":
      case "check": {
        // Full loop: recover → ready → show overdue
        const recovered = await resetCrashed(file);
        if (recovered > 0) {
          console.log(`Recovered ${recovered} crashed task${recovered === 1 ? "" : "s"}`);
        }

        const content = await readFile(file);
        const tasks = parseTasks(content);
        const flat = flattenTasks(tasks);
        const ready = getReady(tasks);
        const now = new Date();

        // Show overdue first
        const overdue = flat.filter(t =>
          t.due && t.due.date < now && t.status !== "x" && t.status !== "~"
        );
        if (overdue.length > 0) {
          console.log(`${overdue.length} overdue:`);
          for (const t of overdue) {
            console.log(formatTaskLine(t));
          }
          console.log("");
        }

        if (ready.length === 0) {
          console.log("No ready tasks.");
          break;
        }

        console.log(`${ready.length} ready task${ready.length === 1 ? "" : "s"}:`);
        for (const t of ready) {
          console.log(formatTaskLine(t));
        }
        break;
      }

      default:
        die(`unknown command: ${command}. Run 'mxit --help' for usage.`);
    }
  } catch (e: unknown) {
    if (e instanceof Error) {
      die(e.message);
    }
    throw e;
  }
}

main();
