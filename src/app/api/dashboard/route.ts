import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/api";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function GET() {
  return withErrorHandling(async () => {
    const now = new Date();
    const monthStart = startOfMonth(now);

    const [
      purchaseAgg,
      saleAgg,
      purchaseAggMonth,
      saleAggMonth,
      itemCount,
      vendorCount,
      customerCount,
      recentPurchases,
      recentSales,
      rawMaterials,
      products,
    ] = await Promise.all([
      prisma.purchase.aggregate({ _sum: { amount: true, quantity: true } }),
      prisma.sale.aggregate({ _sum: { amount: true, quantity: true } }),
      prisma.purchase.aggregate({
        _sum: { amount: true },
        where: { date: { gte: monthStart } },
      }),
      prisma.sale.aggregate({
        _sum: { amount: true },
        where: { date: { gte: monthStart } },
      }),
      prisma.item.count({ where: { isActive: true } }),
      prisma.vendor.count({ where: { isActive: true } }),
      prisma.customer.count({ where: { isActive: true } }),
      prisma.purchase.findMany({
        orderBy: { date: "desc" },
        take: 6,
        include: { item: true, vendor: true },
      }),
      prisma.sale.findMany({
        orderBy: { date: "desc" },
        take: 6,
        include: { item: true, customer: true },
      }),
      prisma.item.findMany({
        where: { type: "RAW_MATERIAL", isActive: true },
        include: {
          purchases: { select: { quantity: true } },
        },
      }),
      prisma.item.findMany({
        where: { type: "PRODUCT", isActive: true },
        include: {
          sales: { select: { quantity: true, amount: true } },
        },
      }),
    ]);

    const lowStock = rawMaterials
      .map((item) => {
        const purchasedQty = item.purchases.reduce(
          (sum, p) => sum + p.quantity,
          0
        );
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

    const topProducts = products
      .map((item) => {
        const soldQty = item.sales.reduce((sum, s) => sum + s.quantity, 0);
        const soldAmount = item.sales.reduce((sum, s) => sum + s.amount, 0);
        return { id: item.id, name: item.name, soldQty, soldAmount };
      })
      .filter((p) => p.soldQty > 0)
      .sort((a, b) => b.soldAmount - a.soldAmount)
      .slice(0, 5);

    const totalPurchases = purchaseAgg._sum.amount ?? 0;
    const totalSales = saleAgg._sum.amount ?? 0;

    return NextResponse.json({
      totals: {
        purchases: totalPurchases,
        sales: totalSales,
        profit: totalSales - totalPurchases,
        purchaseQty: purchaseAgg._sum.quantity ?? 0,
        saleQty: saleAgg._sum.quantity ?? 0,
      },
      month: {
        purchases: purchaseAggMonth._sum.amount ?? 0,
        sales: saleAggMonth._sum.amount ?? 0,
      },
      counts: {
        items: itemCount,
        vendors: vendorCount,
        customers: customerCount,
      },
      recentPurchases,
      recentSales,
      lowStock,
      topProducts,
    });
  });
}
