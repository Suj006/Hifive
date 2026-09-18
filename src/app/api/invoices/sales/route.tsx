import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { prisma } from "@/lib/prisma";
import { withErrorHandling, jsonError } from "@/lib/api";
import { SalesInvoiceDocument, type InvoiceLine } from "@/components/invoice/sales-invoice-document";

function buildInvoiceNumber(invoiceNumbers: (string | null)[]): string {
  const distinct = new Set(invoiceNumbers.filter((n): n is string => !!n && n.trim() !== ""));
  if (distinct.size === 1) return [...distinct][0];
  const today = new Date();
  const stamp = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
    today.getDate()
  ).padStart(2, "0")}`;
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `HF-${stamp}-${rand}`;
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const idsParam = request.nextUrl.searchParams.get("ids") ?? "";
    const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) return jsonError("No sale entries selected", 400);

    const sales = await prisma.sale.findMany({
      where: { id: { in: ids } },
      include: { item: true, customer: true },
      orderBy: { date: "asc" },
    });
    if (sales.length !== ids.length) {
      return jsonError("Some selected sale entries could not be found", 404);
    }

    const customerIds = new Set(sales.map((s) => s.customerId));
    if (customerIds.size > 1) {
      return jsonError("All selected entries must belong to the same customer", 400);
    }

    const customer = sales[0].customer;
    const lines: InvoiceLine[] = sales.map((s) => ({
      date: s.date.toISOString(),
      itemName: s.item.name,
      unit: s.item.unit,
      quantity: s.quantity,
      rate: s.rate,
      discount: s.discount,
      amount: s.amount,
    }));
    const paymentModes = [...new Set(sales.map((s) => s.paymentMode).filter((m): m is string => !!m))];
    const invoiceNumber = buildInvoiceNumber(sales.map((s) => s.invoiceNumber));

    const buffer = await renderToBuffer(
      <SalesInvoiceDocument
        invoiceNumber={invoiceNumber}
        invoiceDate={new Date().toISOString()}
        customer={{
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
        }}
        lines={lines}
        paymentModes={paymentModes}
      />
    );

    const safeCustomer = customer.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="invoice-${safeCustomer}-${invoiceNumber}.pdf"`,
      },
    });
  });
}
