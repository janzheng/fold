import { parseTasks } from "./parse.ts";
import { getReady } from "./ready.ts";
import { validateFormat } from "./validate.ts";
import { claimTask, completeTask, failTask, resetCrashed, addDiscoveredTask } from "./fileops.ts";

const HELP = `mxit — markdown-native task management

Usage: mxit <command> <file> [options]

Commands:
  ready    <file> [--json]               Show ready (actionable) tasks
  claim    <file> <line> --agent <name>   Claim a task for an agent
  done     <file> <line> [--result <msg>] Mark task complete
  fail     <file> <line> --error <msg>    Mark task failed
  validate <file>                         Check format for errors
  recover  <file>                         Reset crashed [@] tasks to [ ]
  run      <file> [--agent <name>]        Full loop: recover → ready → dispatch

States: [ ] open, [@] ongoing, [x] done, [~] obsolete, [?] question, [!] important, [*] starred
Tags:   #error, #error=N, #stuck, #blocked-by:tag, #discovered
`;

function die(msg: string): never {
  console.error(`error: ${msg}`);
  Deno.exit(1);
}

function getArg(args: string[], flag: string): string | undefined {
  const idx = args.indexOf(flag);
  if (idx === -1 || idx + 1 >= args.length) return undefined;
  return args[idx + 1];
}

function hasFlag(args: string[], flag: string): boolean {
  return args.includes(flag);
}

async function main() {
  const args = Deno.args;

  if (args.length === 0 || hasFlag(args, "--help") || hasFlag(args, "-h")) {
    console.log(HELP);
    Deno.exit(0);
  }

  const command = args[0];
  const file = args[1];

  if (!file && command !== "help") {
    die(`missing file argument. Usage: mxit ${command} <file>`);
  }

  switch (command) {
    case "ready": {
      const content = await Deno.readTextFile(file);
      const tasks = parseTasks(content);
      const ready = getReady(tasks);

      if (hasFlag(args, "--json")) {
        console.log(JSON.stringify(ready.map(t => ({
          line: t.line,
          status: t.status,
          description: t.description,
          tags: t.tags,
          agent: t.agent,
          annotations: t.annotations,
        })), null, 2));
      } else {
        if (ready.length === 0) {
          console.log("No ready tasks.");
        } else {
          for (const t of ready) {
            const marker = t.status === "!" ? "[!]" : "[ ]";
            const tags = t.tags.length > 0 ? " " + t.tags.map(tg => `#${tg.name}`).join(" ") : "";
            console.log(`  L${t.line}  ${marker} ${t.description}${tags}`);
          }
        }
      }
      break;
    }

    case "claim": {
      const lineStr = args[2];
      const agent = getArg(args, "--agent");
      if (!lineStr) die("missing line number. Usage: mxit claim <file> <line> --agent <name>");
      if (!agent) die("missing --agent flag. Usage: mxit claim <file> <line> --agent <name>");
      const line = parseInt(lineStr);
      if (isNaN(line)) die(`invalid line number: ${lineStr}`);
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
      await failTask(file, line, error, maxRetries);
      console.log(`Failed L${line}: ${error}`);
      break;
    }

    case "validate": {
      const content = await Deno.readTextFile(file);
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

    case "run": {
      // Full loop: recover → ready → print
      const recovered = await resetCrashed(file);
      if (recovered > 0) {
        console.log(`Recovered ${recovered} crashed task${recovered === 1 ? "" : "s"}`);
      }

      const content = await Deno.readTextFile(file);
      const tasks = parseTasks(content);
      const ready = getReady(tasks);

      if (ready.length === 0) {
        console.log("No ready tasks. Done.");
        break;
      }

      console.log(`${ready.length} ready task${ready.length === 1 ? "" : "s"}:`);
      for (const t of ready) {
        const marker = t.status === "!" ? "[!]" : "[ ]";
        console.log(`  L${t.line}  ${marker} ${t.description}`);
      }

      // Note: actual agent dispatch would go here.
      // For now, `run` just shows what's ready after recovery.
      // A full runner would: claim → invoke agent → done/fail → loop
      console.log("\nUse 'mxit claim' + 'mxit done/fail' to process tasks.");
      break;
    }

    default:
      die(`unknown command: ${command}. Run 'mxit --help' for usage.`);
  }
}

main();
