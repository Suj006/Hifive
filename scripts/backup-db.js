// Shared by the dev/start wrapper (backup on server close) and the
// in-app "Backup now" API route (on-demand backup) — kept as plain
// CommonJS so both a bare `node` script and Next's server runtime can
// require() it without a build step.
const fs = require("fs");
const path = require("path");

function resolveDbPath() {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  const filePath = url.replace(/^file:/, "");
  return path.resolve(process.cwd(), filePath);
}

function timestampFolder(date = new Date()) {
  return date.toISOString().replace(/:/g, "-").replace(/\..+$/, "");
}

/** Copies the SQLite database (plus any -wal/-shm sidecar files) into backups/<timestamp>/. Returns the backup folder, or null if there was no database file to copy. */
function backupDatabase() {
  const dbPath = resolveDbPath();
  if (!fs.existsSync(dbPath)) return null;

  const stamp = timestampFolder();
  const dir = path.join(process.cwd(), "backups", stamp);
  fs.mkdirSync(dir, { recursive: true });

  const destPath = path.join(dir, path.basename(dbPath));
  fs.copyFileSync(dbPath, destPath);
  for (const suffix of ["-wal", "-shm"]) {
    const sidecar = dbPath + suffix;
    if (fs.existsSync(sidecar)) {
      fs.copyFileSync(sidecar, destPath + suffix);
    }
  }
  return dir;
}

module.exports = { backupDatabase, resolveDbPath };
