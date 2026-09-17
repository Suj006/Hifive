import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { partySchema } from "@/lib/schemas";
import { withErrorHandling } from "@/lib/api";

export async function GET() {
  return withErrorHandling(async () => {
    const customers = await prisma.customer.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { sales: true } } },
    });
    return NextResponse.json(customers);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = partySchema.parse(body);
    const customer = await prisma.customer.create({
      data: {
        ...data,
        phone: data.phone || null,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
      },
    });
    return NextResponse.json(customer, { status: 201 });
  });
}
