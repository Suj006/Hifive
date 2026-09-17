import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const params = request.nextUrl.searchParams;
    const from = params.get("from");
    const to = params.get("to");

    const dateFilter = {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    };

    const [purchases, sales] = await Promise.all([
      prisma.purchase.findMany({
        where: { date: dateFilter },
        include: { item: true, vendor: true },
      }),
      prisma.sale.findMany({
        where: { date: dateFilter },
        include: { item: { include: { category: true } }, customer: true },
      }),
    ]);

    // Item-wise purchases (raw materials)
    const itemPurchaseMap = new Map<
      string,
      { itemId: string; name: string; code: string; unit: string; qty: number; amount: number }
    >();
    for (const p of purchases) {
      const key = p.itemId;
      const entry = itemPurchaseMap.get(key) ?? {
        itemId: p.itemId,
        name: p.item.name,
        code: p.item.code,
        unit: p.item.unit,
        qty: 0,
        amount: 0,
      };
      entry.qty += p.quantity;
      entry.amount += p.amount;
      itemPurchaseMap.set(key, entry);
    }
    const itemWisePurchases = Array.from(itemPurchaseMap.values()).sort(
      (a, b) => b.amount - a.amount
    );

    // Item + category-wise sales (products)
    const itemSaleMap = new Map<
      string,
      {
        itemId: string;
        name: string;
        code: string;
        unit: string;
        category: string;
        qty: number;
        amount: number;
      }
    >();
    for (const s of sales) {
      const key = s.itemId;
      const entry = itemSaleMap.get(key) ?? {
        itemId: s.itemId,
        name: s.item.name,
        code: s.item.code,
        unit: s.item.unit,
        category: s.item.category?.name ?? "—",
        qty: 0,
        amount: 0,
      };
      entry.qty += s.quantity;
      entry.amount += s.amount;
      itemSaleMap.set(key, entry);
    }
    const itemWiseSales = Array.from(itemSaleMap.values()).sort(
      (a, b) => b.amount - a.amount
    );

    // Vendor-wise purchases
    const vendorMap = new Map<string, { vendorId: string; name: string; qty: number; amount: number; entries: number }>();
    for (const p of purchases) {
      const entry = vendorMap.get(p.vendorId) ?? {
        vendorId: p.vendorId,
        name: p.vendor.name,
        qty: 0,
        amount: 0,
        entries: 0,
      };
      entry.qty += p.quantity;
      entry.amount += p.amount;
      entry.entries += 1;
      vendorMap.set(p.vendorId, entry);
    }
    const vendorWise = Array.from(vendorMap.values()).sort((a, b) => b.amount - a.amount);

    // Customer-wise sales
    const customerMap = new Map<string, { customerId: string; name: string; qty: number; amount: number; entries: number }>();
    for (const s of sales) {
      const entry = customerMap.get(s.customerId) ?? {
        customerId: s.customerId,
        name: s.customer.name,
        qty: 0,
        amount: 0,
        entries: 0,
      };
      entry.qty += s.quantity;
      entry.amount += s.amount;
      entry.entries += 1;
      customerMap.set(s.customerId, entry);
    }
    const customerWise = Array.from(customerMap.values()).sort((a, b) => b.amount - a.amount);

    // Category-wise sales
    const categoryMap = new Map<string, { category: string; qty: number; amount: number }>();
    for (const s of sales) {
      const name = s.item.category?.name ?? "No category";
      const entry = categoryMap.get(name) ?? { category: name, qty: 0, amount: 0 };
      entry.qty += s.quantity;
      entry.amount += s.amount;
      categoryMap.set(name, entry);
    }
    const categoryWise = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);

    const totals = {
      purchaseAmount: purchases.reduce((s, p) => s + p.amount, 0),
      purchaseQty: purchases.reduce((s, p) => s + p.quantity, 0),
      saleAmount: sales.reduce((s, sale) => s + sale.amount, 0),
      saleQty: sales.reduce((s, sale) => s + sale.quantity, 0),
    };

    return NextResponse.json({
      totals,
      itemWisePurchases,
      itemWiseSales,
      vendorWise,
      customerWise,
      categoryWise,
    });
  });
}
