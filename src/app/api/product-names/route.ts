import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { productNameSchema } from "@/lib/schemas";
import { withErrorHandling } from "@/lib/api";

export async function GET() {
  return withErrorHandling(async () => {
    const productNames = await prisma.productName.findMany({
      orderBy: { name: "asc" },
    });
    const withUsage = await Promise.all(
      productNames.map(async (p) => ({
        ...p,
        _count: {
          items: await prisma.item.count({ where: { name: p.name, type: "PRODUCT" } }),
        },
      }))
    );
    return NextResponse.json(withUsage);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = productNameSchema.parse(body);
    const productName = await prisma.productName.create({ data });
    return NextResponse.json(productName, { status: 201 });
  });
}
