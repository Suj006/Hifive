#!/usr/bin/env node
// Wraps `next dev` / `next start` so that closing the server (Ctrl+C, or a
// normal stop) automatically backs up the database first. Next's own CLI
// process handles SIGINT/SIGTERM itself, so there's no way to hook into that
// from inside an API route — this wrapper is what actually gets the signal.
require("dotenv/config");
const { spawn } = require("child_process");
const { backupDatabase } = require("./backup-db");

const mode = process.argv[2] === "start" ? "start" : "dev";
const nextBin = require.resolve("next/dist/bin/next");

const child = spawn(process.execPath, [nextBin, mode], {
  stdio: "inherit",
  env: process.env,
});

let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  try {
    const dir = backupDatabase();
    if (dir) {
      console.log(`\n[backup] Server closing — saved a copy of your data to ${dir}`);
    }
  } catch (err) {
    console.error("[backup] Could not back up the database:", err.message);
  }
  // Give the child a moment to shut down cleanly on its own before forcing it.
  child.kill(signal);
  setTimeout(() => {
    if (!child.killed) child.kill("SIGKILL");
  }, 3000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

child.on("exit", (code, signal) => {
  if (!shuttingDown) {
    // The child exited on its own (e.g. crashed or was told to stop some
    // other way) — still worth a backup before this process ends too.
    shutdown(signal || "SIGTERM");
  }
  process.exitCode = code ?? 0;
});
