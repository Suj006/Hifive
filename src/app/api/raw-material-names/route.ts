import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rawMaterialNameSchema } from "@/lib/schemas";
import { withErrorHandling } from "@/lib/api";

export async function GET() {
  return withErrorHandling(async () => {
    const rawMaterialNames = await prisma.rawMaterialName.findMany({
      orderBy: { name: "asc" },
    });
    const withUsage = await Promise.all(
      rawMaterialNames.map(async (p) => ({
        ...p,
        _count: {
          items: await prisma.item.count({ where: { name: p.name, type: "RAW_MATERIAL" } }),
        },
      }))
    );
    return NextResponse.json(withUsage);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = rawMaterialNameSchema.parse(body);
    const rawMaterialName = await prisma.rawMaterialName.create({ data });
    return NextResponse.json(rawMaterialName, { status: 201 });
  });
}
