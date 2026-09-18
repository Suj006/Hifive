import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/schemas";
import { withErrorHandling, jsonError } from "@/lib/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const body = await request.json();
    const data = customerSchema.parse(body);
    const phone = data.phone || null;

    if (phone) {
      const dup = await prisma.customer.findUnique({ where: { phone } });
      if (dup && dup.id !== id) {
        return jsonError(
          `This phone number is already used by ${dup.name} (${dup.code}).`,
          409
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        phone,
        email: data.email || null,
        address: data.address || null,
        notes: data.notes || null,
        isActive: data.isActive,
        dobMonth: data.dobMonth ?? null,
        dobDay: data.dobDay ?? null,
      },
    });
    return NextResponse.json(customer);
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withErrorHandling(async () => {
    const { id } = await params;
    const usage = await prisma.customer.findUnique({
      where: { id },
      select: { _count: { select: { sales: true } } },
    });
    if (usage && usage._count.sales > 0) {
      return jsonError(
        "This customer has sale entries linked to it. Mark it inactive instead of deleting.",
        409
      );
    }
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  });
}
