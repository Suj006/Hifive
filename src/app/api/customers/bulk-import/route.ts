import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling, jsonError } from "@/lib/api";
import { generatePartyCode } from "@/lib/party-code";

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
    // Phone numbers, on the other hand, must be unique per customer, so a row
    // whose phone collides with an existing (or already-imported) customer is
    // skipped rather than silently creating a duplicate person.
    const existing = await prisma.customer.findMany({ select: { name: true, phone: true } });
    const existingKeys = new Set(existing.map((c) => c.name.trim().toLowerCase()));
    const existingPhones = new Set(existing.map((c) => c.phone).filter((p): p is string => !!p));
    const seenInBatch = new Set<string>();
    const seenPhonesInBatch = new Set<string>();

    let sequence = (await prisma.customer.count()) + 1;
    let imported = 0;
    let skipped = 0;
    for (const row of rows) {
      const name = row.name?.trim();
      const key = name?.toLowerCase();
      const phone = row.phone?.trim() || null;
      if (!name || !key || existingKeys.has(key) || seenInBatch.has(key)) {
        skipped++;
        continue;
      }
      if (phone && (existingPhones.has(phone) || seenPhonesInBatch.has(phone))) {
        skipped++;
        continue;
      }
      seenInBatch.add(key);
      if (phone) seenPhonesInBatch.add(phone);
      await prisma.customer.create({
        data: {
          name,
          phone,
          email: row.email?.trim() || null,
          address: row.address?.trim() || null,
          notes: row.notes?.trim() || null,
          code: generatePartyCode("customer", sequence++),
        },
      });
      imported++;
    }

    return NextResponse.json({ imported, skipped });
  });
}
