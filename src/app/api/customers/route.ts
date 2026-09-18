import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";
import { generatePartyCode } from "@/lib/party-code";

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
    const data = customerSchema.parse(body);
    const phone = data.phone || null;

    if (phone) {
      const dup = await prisma.customer.findUnique({ where: { phone } });
      if (dup) {
        return jsonError(
          `This phone number is already used by ${dup.name} (${dup.code}).`,
          409
        );
      }
    }

    const sequence = (await prisma.customer.count()) + 1;
    const code = generatePartyCode("customer", sequence);

    const customer = await prisma.customer.create({
      data: {
        name: data.name,
        phone,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
        isActive: data.isActive,
        dobMonth: data.dobMonth ?? null,
        dobDay: data.dobDay ?? null,
        code,
      },
    });
    return NextResponse.json(customer, { status: 201 });
  });
}
