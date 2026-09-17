import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";
import {
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const users = await prisma.user.findMany();
    const user = users.find(
      (u) => u.username.toLowerCase() === data.username.trim().toLowerCase()
    );
    if (!user) return jsonError("Invalid username or password.", 401);

    const valid = await bcrypt.compare(data.password, user.passwordHash);
    if (!valid) return jsonError("Invalid username or password.", 401);

    const token = await createSessionToken(user.id, user.username);
    const store = await cookies();
    store.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: SESSION_COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ username: user.username });
  });
}
