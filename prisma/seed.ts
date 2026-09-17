import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { generateItemCode, computeVariantKey } from "../src/lib/item-code";
import type { ItemType } from "../src/lib/types";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10, 0, 0, 0);
  return d;
}

let rmSeq = 0;
let pdSeq = 0;

function createItem(data: {
  name: string;
  type: ItemType;
  unit: string;
  group: string;
  openingStock: number;
  reorderLevel: number;
  categoryId?: string | null;
}) {
  const sequence = data.type === "RAW_MATERIAL" ? ++rmSeq : ++pdSeq;
  return prisma.item.create({
    data: {
      name: data.name,
      type: data.type,
      unit: data.unit,
      group: data.group,
      openingStock: data.openingStock,
      reorderLevel: data.reorderLevel,
      categoryId: data.categoryId ?? null,
      code: generateItemCode(data.type, sequence),
      variantKey: computeVariantKey(data.name, data.type, data.categoryId ?? null),
    },
  });
}

async function main() {
  console.log("Seeding Hi Five by Jia sample data…");

  const categories = await Promise.all(
    ["Kids", "Adults", "Unisex", "Male", "Female"].map((name) =>
      prisma.category.create({ data: { name } })
    )
  );
  const [kids, adults, unisex] = categories;

  await Promise.all(
    [
      "Friendship Bracelet — Classic",
      "Charm Bracelet — Heart",
      "Beaded Name Bracelet",
      "Beaded Keychain",
    ].map((name) => prisma.productName.create({ data: { name } }))
  );

  const rawMaterials = await Promise.all(
    [
      { name: "Silk Thread — Assorted", unit: "meter", group: "Thread", openingStock: 50, reorderLevel: 30 },
      { name: "Glass Seed Beads", unit: "gram", group: "Beads", openingStock: 200, reorderLevel: 100 },
      { name: "Heart Charms (Gold)", unit: "pcs", group: "Charms", openingStock: 40, reorderLevel: 20 },
      { name: "Alphabet Beads Set", unit: "pcs", group: "Beads", openingStock: 60, reorderLevel: 25 },
      { name: "Elastic Cord", unit: "meter", group: "Cord", openingStock: 30, reorderLevel: 15 },
      { name: "Lobster Clasps", unit: "pcs", group: "Findings", openingStock: 25, reorderLevel: 15 },
    ].map((d) => createItem({ ...d, type: "RAW_MATERIAL" }))
  );

  // "Charm Bracelet — Heart" is deliberately seeded twice, once per category, to
  // demonstrate that the same product name can have its own stock per category.
  const products = await Promise.all([
    createItem({ name: "Friendship Bracelet — Classic", type: "PRODUCT", unit: "pcs", group: "Bracelet", openingStock: 5, reorderLevel: 0, categoryId: unisex.id }),
    createItem({ name: "Charm Bracelet — Heart", type: "PRODUCT", unit: "pcs", group: "Bracelet", openingStock: 5, reorderLevel: 0, categoryId: kids.id }),
    createItem({ name: "Charm Bracelet — Heart", type: "PRODUCT", unit: "pcs", group: "Bracelet", openingStock: 4, reorderLevel: 0, categoryId: adults.id }),
    createItem({ name: "Beaded Name Bracelet", type: "PRODUCT", unit: "pcs", group: "Bracelet", openingStock: 5, reorderLevel: 0, categoryId: adults.id }),
    createItem({ name: "Beaded Keychain", type: "PRODUCT", unit: "pcs", group: "Keychain", openingStock: 8, reorderLevel: 0, categoryId: unisex.id }),
  ]);

  const vendors = await Promise.all(
    [
      { name: "Sundar Bead House", phone: "+91 98765 43210", address: "Zaveri Bazaar, Mumbai" },
      { name: "Craftsy Supplies Co.", phone: "+91 91234 56780", address: "T. Nagar, Chennai" },
      { name: "Rainbow Thread Traders", phone: "+91 99887 66554", address: "Karol Bagh, Delhi" },
    ].map((d) => prisma.vendor.create({ data: d }))
  );

  const customers = await Promise.all(
    [
      { name: "Ananya Sharma", phone: "+91 90000 11122" },
      { name: "Rhea Kapoor", phone: "+91 90000 33344" },
      { name: "Meera Nair", phone: "+91 90000 55566" },
      { name: "Kabir Singh", phone: "+91 90000 77788" },
    ].map((d) => prisma.customer.create({ data: d }))
  );

  const paymentModes = ["UPI", "Cash", "Bank Transfer"];

  const purchaseSeed = [
    { item: rawMaterials[0], vendor: vendors[2], daysBack: 45, quantity: 40, rate: 8 },
    { item: rawMaterials[1], vendor: vendors[0], daysBack: 40, quantity: 150, rate: 2.5 },
    { item: rawMaterials[2], vendor: vendors[1], daysBack: 35, quantity: 30, rate: 15 },
    { item: rawMaterials[3], vendor: vendors[0], daysBack: 28, quantity: 50, rate: 4 },
    { item: rawMaterials[4], vendor: vendors[2], daysBack: 20, quantity: 25, rate: 6 },
    { item: rawMaterials[5], vendor: vendors[1], daysBack: 15, quantity: 20, rate: 10 },
    { item: rawMaterials[1], vendor: vendors[0], daysBack: 8, quantity: 100, rate: 2.5 },
    { item: rawMaterials[0], vendor: vendors[2], daysBack: 3, quantity: 20, rate: 8.5 },
  ];

  for (const [i, p] of purchaseSeed.entries()) {
    const amount = p.quantity * p.rate;
    await prisma.purchase.create({
      data: {
        date: daysAgo(p.daysBack),
        itemId: p.item.id,
        vendorId: p.vendor.id,
        quantity: p.quantity,
        rate: p.rate,
        amount,
        paymentMode: paymentModes[i % paymentModes.length],
        invoiceNumber: `PB-${1000 + i}`,
      },
    });
  }

  const productionSeed = [
    { item: products[0], daysBack: 25, quantity: 5, notes: "Batch 1" },
    { item: products[1], daysBack: 22, quantity: 3, notes: "Batch 1" },
    { item: products[2], daysBack: 18, quantity: 2, notes: "Batch 1" },
    { item: products[3], daysBack: 24, quantity: 6, notes: "Batch 1" },
    { item: products[4], daysBack: 16, quantity: 10, notes: "Batch 1" },
  ];

  for (const p of productionSeed) {
    await prisma.production.create({
      data: {
        date: daysAgo(p.daysBack),
        itemId: p.item.id,
        quantity: p.quantity,
        notes: p.notes,
      },
    });
  }

  const saleSeed = [
    { item: products[0], customer: customers[0], daysBack: 30, quantity: 2, rate: 249 },
    { item: products[1], customer: customers[1], daysBack: 26, quantity: 1, rate: 349 },
    { item: products[3], customer: customers[2], daysBack: 20, quantity: 3, rate: 299 },
    { item: products[4], customer: customers[3], daysBack: 14, quantity: 4, rate: 149 },
    { item: products[0], customer: customers[1], daysBack: 10, quantity: 1, rate: 249 },
    { item: products[2], customer: customers[0], daysBack: 5, quantity: 2, rate: 349 },
    { item: products[3], customer: customers[3], daysBack: 2, quantity: 1, rate: 299 },
  ];

  for (const [i, s] of saleSeed.entries()) {
    const amount = s.quantity * s.rate;
    await prisma.sale.create({
      data: {
        date: daysAgo(s.daysBack),
        itemId: s.item.id,
        customerId: s.customer.id,
        quantity: s.quantity,
        rate: s.rate,
        discount: 0,
        amount,
        paymentMode: paymentModes[i % paymentModes.length],
        invoiceNumber: `SL-${2000 + i}`,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
