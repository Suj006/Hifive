import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";
import { getSession } from "@/lib/session";

async function requireAdmin() {
  const session = await getSession();
  if (!session) return { denied: jsonError("Not signed in.", 401), session: null };
  if (session.role !== "ADMIN")
    return { denied: jsonError("Admin access required.", 403), session: null };
  return { denied: null, session };
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { denied } = await requireAdmin();
    if (denied) return denied;

    const { id } = await params;
    const body = await request.json();
    const data = updateUserSchema.parse(body);

    const update: { role?: "ADMIN" | "VIEWER"; passwordHash?: string } = {};
    if (data.role) update.role = data.role;
    if (data.password) update.passwordHash = await bcrypt.hash(data.password, 10);

    if (data.role === "VIEWER") {
      const admins = await prisma.user.count({ where: { role: "ADMIN" } });
      const target = await prisma.user.findUnique({ where: { id } });
      if (target?.role === "ADMIN" && admins <= 1) {
        return jsonError("There must be at least one admin account.", 409);
      }
    }

    const user = await prisma.user.update({
      where: { id },
      data: update,
      select: { id: true, username: true, role: true, createdAt: true },
    });
    return NextResponse.json(user);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { denied, session } = await requireAdmin();
    if (denied) return denied;

    const { id } = await params;
    if (session!.uid === id) {
      return jsonError("You can't delete your own account while signed in.", 409);
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (target?.role === "ADMIN") {
      const admins = await prisma.user.count({ where: { role: "ADMIN" } });
      if (admins <= 1) {
        return jsonError("There must be at least one admin account.", 409);
      }
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
