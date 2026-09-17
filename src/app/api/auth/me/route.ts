import { NextResponse } from "next/server";
import { withErrorHandling, jsonError } from "@/lib/api";
import { getSession } from "@/lib/session";

export async function GET() {
  return withErrorHandling(async () => {
    const session = await getSession();
    if (!session) return jsonError("Not signed in.", 401);
    return NextResponse.json({ username: session.username });
  });
}
