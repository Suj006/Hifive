import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expenseSchema } from "@/lib/schemas";
import { withErrorHandling } from "@/lib/api";

export async function GET() {
  return withErrorHandling(async () => {
    const expenses = await prisma.expense.findMany({
      orderBy: { date: "desc" },
    });
    return NextResponse.json(expenses);
  });
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const body = await request.json();
    const data = expenseSchema.parse(body);
    const expense = await prisma.expense.create({
      data: {
        ...data,
        paymentMode: data.paymentMode || null,
        notes: data.notes || null,
      },
    });
    return NextResponse.json(expense, { status: 201 });
  });
}
