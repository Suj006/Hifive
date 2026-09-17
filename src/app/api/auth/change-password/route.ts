import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const session = await getSession();
    if (!session) return jsonError("Not signed in.", 401);

    const body = await request.json();
    const data = changePasswordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { id: session.uid } });
    if (!user) return jsonError("Not signed in.", 401);

    const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!valid) return jsonError("Current password is incorrect.", 422);

    const passwordHash = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });

    return NextResponse.json({ ok: true });
  });
}
