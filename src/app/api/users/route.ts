import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";
import { getSession } from "@/lib/session";

// Belt-and-braces: proxy.ts already blocks Viewer accounts from /api/users
// entirely, but a route this sensitive checks for itself too.
async function requireAdmin() {
  const session = await getSession();
  if (!session) return jsonError("Not signed in.", 401);
  if (session.role !== "ADMIN") return jsonError("Admin access required.", 403);
  return null;
}

export async function GET() {
  return withErrorHandling(async () => {
    const denied = await requireAdmin();
    if (denied) return denied;

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, username: true, role: true, createdAt: true },
    });
    return NextResponse.json(users);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const denied = await requireAdmin();
    if (denied) return denied;

    const body = await request.json();
    const data = createUserSchema.parse(body);
    const passwordHash = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: { username: data.username, passwordHash, role: data.role },
      select: { id: true, username: true, role: true, createdAt: true },
    });
    return NextResponse.json(user, { status: 201 });
  });
}
