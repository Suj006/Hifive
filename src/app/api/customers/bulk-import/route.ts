import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling, jsonError } from "@/lib/api";

interface ImportRow {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const rows = Array.isArray(body.rows) ? (body.rows as ImportRow[]) : [];
    if (rows.length === 0) return jsonError("No rows to import", 400);

    // Customer names aren't DB-unique (two real customers can share a name),
    // but the import still warns/skips same-name matches by default since
    // that's almost always an accidental re-upload, not two different people.
    const existing = await prisma.customer.findMany({ select: { name: true } });
    const existingKeys = new Set(existing.map((c) => c.name.trim().toLowerCase()));
    const seenInBatch = new Set<string>();

    let imported = 0;
    let skipped = 0;
    for (const row of rows) {
      const name = row.name?.trim();
      const key = name?.toLowerCase();
      if (!name || !key || existingKeys.has(key) || seenInBatch.has(key)) {
        skipped++;
        continue;
      }
      seenInBatch.add(key);
      await prisma.customer.create({
        data: {
          name,
          phone: row.phone?.trim() || null,
          email: row.email?.trim() || null,
          address: row.address?.trim() || null,
          notes: row.notes?.trim() || null,
        },
      });
      imported++;
    }

    return NextResponse.json({ imported, skipped });
  });
}
