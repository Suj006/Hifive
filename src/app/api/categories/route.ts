import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorySchema } from "@/lib/schemas";
import { withErrorHandling } from "@/lib/api";

export async function GET() {
  return withErrorHandling(async () => {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { items: true } } },
    });
    return NextResponse.json(categories);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = categorySchema.parse(body);
    const category = await prisma.category.create({ data });
    return NextResponse.json(category, { status: 201 });
  });
}
