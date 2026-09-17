import { prisma } from "@/lib/prisma";

/** Current stock on hand for an item: opening + purchased (raw material) or opening - sold (product). */
export async function getItemStock(itemId: string): Promise<number | null> {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: {
      type: true,
      openingStock: true,
      purchases: { select: { quantity: true } },
      sales: { select: { quantity: true } },
    },
  });
  if (!item) return null;

  if (item.type === "RAW_MATERIAL") {
    const purchasedQty = item.purchases.reduce((s, p) => s + p.quantity, 0);
    return item.openingStock + purchasedQty;
  }
  const soldQty = item.sales.reduce((s, sale) => s + sale.quantity, 0);
  return item.openingStock - soldQty;
}
