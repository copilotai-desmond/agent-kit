#!/usr/bin/env node
// agent-kit's copy is canonical. A repo may vendor it and must keep the protocol version and state layout.
/**
 * The one decision on a Bash command: pass it, deny it, or run it queued in place.
 *
 *   stdin  { tool_name: "Bash", tool_input: { command, run_in_background }, cwd }
 *   stdout { "deny": "<reason>" } | { "command": "<queued form>", "suggest": "<reason>" } | nothing (pass)
 *
 * It denies a wait loop, a duplicate of a run already queued, and a foreground heavy command
 * whose queue has no free slot it may use. Any other heavy command comes back queued, with
 * `suggest`, the deny that names the queued form, for a caller that may not rewrite in place.
 * Fails open on anything it cannot parse or read.
 *
 * `CONDUCTOR_HOOKS=off` in the environment or the command lets a command through. A repo
 * that runs its own queue sets `CONDUCTOR_QUEUE_MANAGED=1` in its `.claude/settings.json`
 * `env` and gets the wait-loop check only. A repo that only wants to say which of its commands
 * are heavy (or light) lists them in `.conductor/queue.json` (`loadQueueConfig`).
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { duplicateNotice, findDuplicate, isDirectInvocation, memoryAdmits, parseRunArgs, queueDir, resolveSlots } from "../queue.mjs";
import {
  BYPASS_HINT,
  classifyQueued,
  commandHead,
  CONFIG_ENV,
  findUnqueuedHeavy,
  MANAGED_ENV,
  mergeQueueConfigs,
  parseQueueConfig,
  QUEUE_TOKEN,
  queuedForm,
  REPO_CONFIG,
  triage,
} from "./classify.mjs";
import { fullQueueReason, readQueueStatus } from "./full-queue.mjs";
import { commandSegments } from "./shell.mjs";

const QUEUE_MJS = fileURLToPath(new URL("../queue.mjs", import.meta.url));

/** The slot count a `queue.mjs run` segment will run with, resolved as queue.mjs resolves it. */
export function queuedSlots(segment, env) {
  const head = commandHead(segment);
  const parsed = parseRunArgs(head.slice(head.findIndex((t) => QUEUE_TOKEN.test(t)) + 2));
  return resolveSlots({ flag: parsed.slots, env, queue: classifyQueued(segment) });
}

/**
 * Whether the repo holding `cwd` runs its own queue, from its `.claude/settings.json` `env`.
 * The session env is only a fallback outside any repo, because it stays fixed while the session moves between checkouts.
 */
export function repoManaged(cwd, env) {
  const top = repoTop(cwd);
  if (top === null) return env[MANAGED_ENV] === "1";
  try {
    return JSON.parse(readFileSync(path.join(top, ".claude", "settings.json"), "utf8"))?.env?.[MANAGED_ENV] === "1";
  } catch {
    return false;
  }
}

/** The top folder of the repo holding `cwd` (the nearest with a `.git`), or null outside any repo. */
function repoTop(cwd) {
  if (typeof cwd !== "string" || cwd === "") return null;
  let top = path.resolve(cwd);
  while (!existsSync(path.join(top, ".git"))) {
    if (path.dirname(top) === top) return null;
    top = path.dirname(top);
  }
  return top;
}

/**
 * The queue config for a command run in `cwd`: the repo's `.conductor/queue.json`, then the box
 * file `CONDUCTOR_QUEUE_CONFIG` names, the repo's winning. Null when neither exists. A file that
 * is named but unreadable or invalid is skipped with one `warn` line, so a typo never blocks work.
 */
export function loadQueueConfig(cwd, env, warn) {
  const read = (file, required) => {
    if (!required && !existsSync(file)) return null;
    try {
      return parseQueueConfig(readFileSync(file, "utf8"));
    } catch (error) {
      warn(`conductor: ignoring the queue config ${file}: ${error.code === "ENOENT" ? "it does not exist" : error.message}\n`);
      return null;
    }
  };
  const top = repoTop(cwd);
  const boxPath = env[CONFIG_ENV]?.trim();
  return mergeQueueConfigs(top === null ? null : read(path.join(top, REPO_CONFIG), false), boxPath ? read(boxPath, true) : null);
}

/** The deny reason for a foreground command whose queues are full, or null. Slot 0 always admits. */
function fullReason(command, background, env, deps) {
  const slots = new Map();
  for (const segment of commandSegments(command)) {
    const name = classifyQueued(segment);
    if (name && !slots.has(name)) slots.set(name, queuedSlots(segment, env));
  }
  const status = deps.queueStatus ?? ((name) => readQueueStatus(env, name, slots.get(name) ?? resolveSlots({ env, queue: name })));
  const memOk = deps.memoryAdmits ?? (() => memoryAdmits(env));
  const safe = (name) => {
    try {
      return status(name);
    } catch {
      return null;
    }
  };
  return fullQueueReason(command, background, safe, deps.classify ?? classifyQueued, { admits: (i) => i === 0 || memOk() });
}

export function decide(input, env, deps = {}) {
  const command = input?.tool_name === "Bash" ? input.tool_input?.command : null;
  const background = input?.tool_input?.run_in_background;
  let config = null;
  try {
    if (typeof command === "string") config = loadQueueConfig(input.cwd, env, deps.warn ?? ((line) => process.stderr.write(line)));
  } catch {}
  const triaged = triage(command, background, env, config);
  if (triaged.deny) return { deny: triaged.deny };
  if (triaged.pass || repoManaged(input.cwd, env)) return null;
  try {
    const heavy = findUnqueuedHeavy(command, config);
    if (!heavy) {
      const full = fullReason(command, background, env, deps);
      return full ? { deny: full } : null;
    }
    const queued = queuedForm(command, heavy.queue, deps.queueMjs ?? QUEUE_MJS);
    const cwd = input.cwd || process.cwd();
    const dupe = findDuplicate(queueDir(env, heavy.queue), { command, cwd });
    if (dupe) return { deny: duplicateNotice(dupe, { queue: heavy.queue, command, cwd }).trim() };
    const full = fullReason(queued, background, env, deps);
    if (full) return { deny: full };
    const suggest =
      `"${heavy.segment}" is a heavy command and every repo on this box shares one queue. ` +
      `Run the whole command as: ${queued}\nRun it in the background and wait for the completion notice. ${BYPASS_HINT}`;
    return { command: queued, suggest };
  } catch {
    return null;
  }
}

/* c8 ignore start -- process wiring */
if (isDirectInvocation(process.argv[1], import.meta.url)) {
  let out = null;
  try {
    out = decide(JSON.parse(readFileSync(0, "utf8")), process.env);
  } catch {}
  if (out) process.stdout.write(JSON.stringify(out));
  process.exit(0);
}
/* c8 ignore stop */
