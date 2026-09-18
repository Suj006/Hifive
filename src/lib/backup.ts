import fs from "fs";
import path from "path";

// Mirrors scripts/backup-db.js — kept as a separate, plain copy rather than
// importing across the app/scripts boundary. scripts/backup-db.js runs from
// a bare `node` process before Next (or its bundler) is involved at all, so
// the two can't safely share one module.
function resolveDbPath(): string {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  const filePath = url.replace(/^file:/, "");
  // This app always runs as a full local Node process (never a minimal
  // serverless trace), so there's nothing to opt out of at runtime — this
  // just silences Next's build-time "traces the whole project" warning.
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), filePath);
}

function timestampFolder(date = new Date()): string {
  return date.toISOString().replace(/:/g, "-").replace(/\..+$/, "");
}

/** Copies the SQLite database (plus any -wal/-shm sidecar files) into backups/<timestamp>/. Returns the backup folder (relative to the project root), or null if there was no database file to copy. */
export function backupDatabase(): string | null {
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
  return path.relative(process.cwd(), dir);
}
