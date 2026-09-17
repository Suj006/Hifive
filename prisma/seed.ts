import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

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

async function main() {
  console.log("Seeding Hi Five by Jia sample data…");

  const rawMaterials = await Promise.all(
    [
      { name: "Silk Thread — Assorted", unit: "meter", category: "Thread", openingStock: 50, reorderLevel: 30 },
      { name: "Glass Seed Beads", unit: "gram", category: "Beads", openingStock: 200, reorderLevel: 100 },
      { name: "Heart Charms (Gold)", unit: "pcs", category: "Charms", openingStock: 40, reorderLevel: 20 },
      { name: "Alphabet Beads Set", unit: "pcs", category: "Beads", openingStock: 60, reorderLevel: 25 },
      { name: "Elastic Cord", unit: "meter", category: "Cord", openingStock: 30, reorderLevel: 15 },
      { name: "Lobster Clasps", unit: "pcs", category: "Findings", openingStock: 25, reorderLevel: 15 },
    ].map((d) => prisma.item.create({ data: { ...d, type: "RAW_MATERIAL" } }))
  );

  const products = await Promise.all(
    [
      { name: "Friendship Bracelet — Classic", unit: "pcs", category: "Bracelet", openingStock: 5, reorderLevel: 0 },
      { name: "Charm Bracelet — Heart", unit: "pcs", category: "Bracelet", openingStock: 5, reorderLevel: 0 },
      { name: "Beaded Name Bracelet", unit: "pcs", category: "Bracelet", openingStock: 5, reorderLevel: 0 },
      { name: "Beaded Keychain", unit: "pcs", category: "Keychain", openingStock: 8, reorderLevel: 0 },
    ].map((d) => prisma.item.create({ data: { ...d, type: "PRODUCT" } }))
  );

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

  const saleSeed = [
    { item: products[0], customer: customers[0], daysBack: 30, quantity: 2, rate: 249 },
    { item: products[1], customer: customers[1], daysBack: 26, quantity: 1, rate: 349 },
    { item: products[2], customer: customers[2], daysBack: 20, quantity: 3, rate: 299 },
    { item: products[3], customer: customers[3], daysBack: 14, quantity: 4, rate: 149 },
    { item: products[0], customer: customers[1], daysBack: 10, quantity: 1, rate: 249 },
    { item: products[1], customer: customers[0], daysBack: 5, quantity: 2, rate: 349 },
    { item: products[2], customer: customers[3], daysBack: 2, quantity: 1, rate: 299 },
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
