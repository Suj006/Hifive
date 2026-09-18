import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, n: number) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1);
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(date: Date) {
  return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dayLabel(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const params = request.nextUrl.searchParams;
    const fromParam = params.get("from");
    const toParam = params.get("to");
    const categoryId = params.get("categoryId");

    const explicitRange = Boolean(fromParam || toParam);
    const rangeFrom = fromParam ? new Date(fromParam) : null;
    const rangeTo = toParam ? new Date(toParam) : null;
    const spanDays =
      rangeFrom && rangeTo
        ? Math.max(1, Math.round((rangeTo.getTime() - rangeFrom.getTime()) / 86400000))
        : null;
    const useDaily = explicitRange && spanDays !== null && spanDays <= 31;

    const dateFilter = {
      gte: rangeFrom ?? undefined,
      lte: rangeTo ?? undefined,
    };
    // Categories are an audience/segment tag mainly used on finished
    // products, so this filter only narrows the sales side (and anything
    // derived from it) — raw material purchases are left untouched.
    const productFilter = categoryId ? { categoryId } : {};

    const now = new Date();
    const monthStart = startOfMonth(now);

    const [
      purchases,
      sales,
      expenses,
      purchaseAggMonth,
      saleAggMonth,
      expenseAggMonth,
      itemCount,
      vendorCount,
      customerCount,
      rawMaterials,
    ] = await Promise.all([
      prisma.purchase.findMany({
        where: { date: dateFilter },
        include: { item: true, vendor: true },
        orderBy: { date: "desc" },
      }),
      prisma.sale.findMany({
        where: { date: dateFilter, item: productFilter },
        include: { item: { include: { category: true } }, customer: true },
        orderBy: { date: "desc" },
      }),
      prisma.expense.findMany({ where: { date: dateFilter } }),
      prisma.purchase.aggregate({
        _sum: { amount: true },
        where: { date: { gte: monthStart } },
      }),
      prisma.sale.aggregate({
        _sum: { amount: true },
        where: { date: { gte: monthStart } },
      }),
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: { date: { gte: monthStart } },
      }),
      prisma.item.count({ where: { isActive: true } }),
      prisma.vendor.count({ where: { isActive: true } }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.item.findMany({
        where: { type: "RAW_MATERIAL", isActive: true },
        include: { purchases: { select: { quantity: true } } },
      }),
    ]);

    const totalPurchases = purchases.reduce((s, p) => s + p.amount, 0);
    const totalSales = sales.reduce((s, sale) => s + sale.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalPurchaseQty = purchases.reduce((s, p) => s + p.quantity, 0);
    const totalSaleQty = sales.reduce((s, sale) => s + sale.quantity, 0);

    // Trend: monthly buckets, or daily when an explicit range of a month or
    // less is selected. A month/day only appears once something happened in
    // it — for an explicit range we pre-seed every bucket so gaps show as a
    // real zero rather than a skipped point; for the unbounded default view
    // we just cap to the most recent 6 populated months to keep the chart
    // readable rather than spanning the business's entire history.
    const trendMap = new Map<
      string,
      { sortKey: string; label: string; purchases: number; sales: number; expenses: number }
    >();
    function touch(date: Date) {
      const key = useDaily ? dayKey(date) : monthKey(date);
      if (!trendMap.has(key)) {
        trendMap.set(key, {
          sortKey: key,
          label: useDaily ? dayLabel(date) : monthLabel(date),
          purchases: 0,
          sales: 0,
          expenses: 0,
        });
      }
      return trendMap.get(key)!;
    }
    if (explicitRange && rangeFrom && rangeTo) {
      if (useDaily) {
        for (
          let d = new Date(rangeFrom);
          d <= rangeTo;
          d.setDate(d.getDate() + 1)
        ) {
          touch(new Date(d));
        }
      } else {
        let cursor = startOfMonth(rangeFrom);
        const end = startOfMonth(rangeTo);
        while (cursor <= end) {
          touch(cursor);
          cursor = addMonths(cursor, 1);
        }
      }
    }
    for (const p of purchases) touch(new Date(p.date)).purchases += p.amount;
    for (const s of sales) touch(new Date(s.date)).sales += s.amount;
    for (const e of expenses) touch(new Date(e.date)).expenses += e.amount;

    let trendEntries = Array.from(trendMap.values()).sort((a, b) =>
      a.sortKey.localeCompare(b.sortKey)
    );
    if (!explicitRange && !useDaily) {
      trendEntries = trendEntries.slice(-6);
    }
    const trend = trendEntries.map(({ label, purchases: p, sales: s, expenses: e }) => ({
      label,
      purchases: p,
      sales: s,
      expenses: e,
    }));

    // Category-wise sales, for the "sales by category" chart.
    const categoryMap = new Map<string, number>();
    for (const s of sales) {
      const name = s.item.category?.name ?? "No category";
      categoryMap.set(name, (categoryMap.get(name) ?? 0) + s.amount);
    }
    const categoryBreakdown = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8);

    const topProductsMap = new Map<
      string,
      { id: string; name: string; soldQty: number; soldAmount: number }
    >();
    for (const s of sales) {
      const entry = topProductsMap.get(s.itemId) ?? {
        id: s.itemId,
        name: s.item.name,
        soldQty: 0,
        soldAmount: 0,
      };
      entry.soldQty += s.quantity;
      entry.soldAmount += s.amount;
      topProductsMap.set(s.itemId, entry);
    }
    const topProducts = Array.from(topProductsMap.values())
      .sort((a, b) => b.soldAmount - a.soldAmount)
      .slice(0, 5);

    const lowStock = rawMaterials
      .map((item) => {
        const purchasedQty = item.purchases.reduce((sum, p) => sum + p.quantity, 0);
        const stock = item.openingStock + purchasedQty;
        return {
          id: item.id,
          name: item.name,
          unit: item.unit,
          stock,
          reorderLevel: item.reorderLevel,
        };
      })
      .filter((item) => item.reorderLevel > 0 && item.stock <= item.reorderLevel)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 6);

    return NextResponse.json({
      totals: {
        purchases: totalPurchases,
        sales: totalSales,
        expenses: totalExpenses,
        profit: totalSales - totalPurchases - totalExpenses,
        purchaseQty: totalPurchaseQty,
        saleQty: totalSaleQty,
      },
      month: {
        purchases: purchaseAggMonth._sum.amount ?? 0,
        sales: saleAggMonth._sum.amount ?? 0,
        expenses: expenseAggMonth._sum.amount ?? 0,
      },
      counts: {
        items: itemCount,
        vendors: vendorCount,
        customers: customerCount,
      },
      recentPurchases: purchases.slice(0, 6),
      recentSales: sales.slice(0, 6),
      lowStock,
      topProducts,
      trend,
      categoryBreakdown,
    });
  });
}
