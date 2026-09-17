import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { withErrorHandling } from "@/lib/api";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function POST() {
  return withErrorHandling(async () => {
    const store = await cookies();
    store.delete(SESSION_COOKIE_NAME);
    return NextResponse.json({ ok: true });
  });
}
