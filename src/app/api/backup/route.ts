import { NextResponse } from "next/server";
import { withErrorHandling, jsonError } from "@/lib/api";
import { backupDatabase } from "@/lib/backup";

export async function POST() {
  return withErrorHandling(async () => {
    const dir = backupDatabase();
    if (!dir) return jsonError("No database file found to back up.", 404);
    return NextResponse.json({ folder: dir });
  });
}
