import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const params = request.nextUrl.searchParams;
    const from = params.get("from");
    const to = params.get("to");
    const categoryId = params.get("categoryId");
    const vendorId = params.get("vendorId");
    const customerId = params.get("customerId");
    const paymentMode = params.get("paymentMode");

    const dateFilter = {
      gte: from ? new Date(from) : undefined,
      lte: to ? new Date(to) : undefined,
    };
    // Categories are an audience/segment tag mainly used on finished products,
    // so the filter only narrows the product-side sections below (sales,
    // production, inventory) — raw material purchases are left untouched.
    const productFilter = categoryId ? { categoryId } : {};

    const [purchases, sales, expenses, productions, products] = await Promise.all([
      prisma.purchase.findMany({
        where: {
          date: dateFilter,
          vendorId: vendorId ?? undefined,
          paymentMode: paymentMode ?? undefined,
        },
        include: { item: true, vendor: true },
      }),
      prisma.sale.findMany({
        where: {
          date: dateFilter,
          item: productFilter,
          customerId: customerId ?? undefined,
          paymentMode: paymentMode ?? undefined,
        },
        include: { item: { include: { category: true } }, customer: true },
      }),
      // Expense categories are a free-text business-cost tag, unrelated to
      // the product audience Category master, so only date/payment narrow it.
      prisma.expense.findMany({
        where: { date: dateFilter, paymentMode: paymentMode ?? undefined },
      }),
      prisma.production.findMany({
        where: { date: dateFilter, item: productFilter },
        include: { item: { include: { category: true } } },
      }),
      // Full inventory picture: made/sold/remaining for every product, as of
      // now — only the category filter (not the date range) narrows this,
      // since a stock snapshot always reflects the current moment.
      prisma.item.findMany({
        where: { type: "PRODUCT", ...productFilter },
        include: {
          category: true,
          productions: { select: { quantity: true } },
          sales: { select: { quantity: true } },
        },
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

    // Outstanding dues by customer — partially or unpaid sales in this range.
    const duesMap = new Map<string, { customerId: string; name: string; due: number; entries: number }>();
    for (const s of sales) {
      const due = s.amount - s.amountPaid;
      if (due <= 0) continue;
      const entry = duesMap.get(s.customerId) ?? {
        customerId: s.customerId,
        name: s.customer.name,
        due: 0,
        entries: 0,
      };
      entry.due += due;
      entry.entries += 1;
      duesMap.set(s.customerId, entry);
    }
    const duesByCustomer = Array.from(duesMap.values()).sort((a, b) => b.due - a.due);

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

    // Expense-wise breakdown (by category)
    const expenseMap = new Map<string, { category: string; amount: number; entries: number }>();
    for (const e of expenses) {
      const entry = expenseMap.get(e.category) ?? { category: e.category, amount: 0, entries: 0 };
      entry.amount += e.amount;
      entry.entries += 1;
      expenseMap.set(e.category, entry);
    }
    const expenseWise = Array.from(expenseMap.values()).sort((a, b) => b.amount - a.amount);

    // Item + category-wise production (items made)
    const productionMap = new Map<
      string,
      { itemId: string; name: string; code: string; unit: string; category: string; qty: number }
    >();
    for (const p of productions) {
      const entry = productionMap.get(p.itemId) ?? {
        itemId: p.itemId,
        name: p.item.name,
        code: p.item.code,
        unit: p.item.unit,
        category: p.item.category?.name ?? "—",
        qty: 0,
      };
      entry.qty += p.quantity;
      productionMap.set(p.itemId, entry);
    }
    const itemWiseProduction = Array.from(productionMap.values()).sort(
      (a, b) => b.qty - a.qty
    );

    // Full made/sold/remaining picture per product (not date-filtered)
    const productInventory = products
      .map((item) => {
        const made = item.productions.reduce((s, p) => s + p.quantity, 0);
        const sold = item.sales.reduce((s, sale) => s + sale.quantity, 0);
        return {
          itemId: item.id,
          name: item.name,
          code: item.code,
          unit: item.unit,
          category: item.category?.name ?? "—",
          openingStock: item.openingStock,
          made,
          sold,
          remaining: item.openingStock + made - sold,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    const totals = {
      purchaseAmount: purchases.reduce((s, p) => s + p.amount, 0),
      purchaseQty: purchases.reduce((s, p) => s + p.quantity, 0),
      saleAmount: sales.reduce((s, sale) => s + sale.amount, 0),
      saleQty: sales.reduce((s, sale) => s + sale.quantity, 0),
      expenseAmount: expenses.reduce((s, e) => s + e.amount, 0),
      dueAmount: sales.reduce((s, sale) => s + Math.max(0, sale.amount - sale.amountPaid), 0),
    };

    return NextResponse.json({
      totals,
      itemWisePurchases,
      itemWiseSales,
      itemWiseProduction,
      productInventory,
      vendorWise,
      customerWise,
      categoryWise,
      expenseWise,
      duesByCustomer,
    });
  });
}
