import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { partySchema } from "@/lib/schemas";
import { withErrorHandling } from "@/lib/api";
import { generatePartyCode } from "@/lib/party-code";

export async function GET() {
  return withErrorHandling(async () => {
    const vendors = await prisma.vendor.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { purchases: true } },
        purchases: { select: { amount: true } },
      },
    });
    const withTotals = vendors.map(({ purchases, ...v }) => ({
      ...v,
      totalPurchased: purchases.reduce((s, p) => s + p.amount, 0),
    }));
    return NextResponse.json(withTotals);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = partySchema.parse(body);
    const sequence = (await prisma.vendor.count()) + 1;
    const code = generatePartyCode("vendor", sequence);
    const vendor = await prisma.vendor.create({
      data: {
        ...data,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
        code,
      },
    });
    return NextResponse.json(vendor, { status: 201 });
  });
}
