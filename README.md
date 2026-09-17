# Hi Five by Jia

A purchase & sale ledger web app for **Hi Five by Jia** — a handmade bracelet
and accessories brand. Built to keep track of raw material purchases and
finished-product sales against a shared item master, with every amount in INR.

## What it does

- **Item Master** — a single catalog of raw materials (beads, thread, charms…)
  and finished products (bracelets, keychains…), each with a unit, category,
  opening stock and reorder level.
- **Vendors** & **Customers** — master records for who you buy from and sell to.
- **Purchases** — record raw material purchases against the item master: date,
  vendor, quantity, rate and amount (auto-calculated, editable), invoice
  number, payment mode and notes.
- **Sales** — record finished-product sales against the item master: date,
  customer, quantity, rate, discount and amount, invoice number and payment
  mode.
- **Dashboard** — total purchases, total sales, net profit, this month's
  figures, recent activity, low-stock raw materials and top-selling products.

All monetary values are stored and displayed in INR (₹).

## Tech stack

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack) + TypeScript
- Tailwind CSS v4, themed to the Hi Five by Jia brand colours
- [Prisma 7](https://www.prisma.io/) + SQLite (via the `@prisma/adapter-better-sqlite3` driver adapter)
- Zod for API input validation

## Getting started

```bash
npm install
cp .env.example .env          # DATABASE_URL="file:./dev.db"
npx prisma migrate deploy     # create the SQLite database
npm run db:seed               # optional: load sample data
npm run dev                   # http://localhost:3000
```

## Useful scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint the codebase |
| `npm run db:seed` | Seed sample vendors, customers, items, purchases & sales |
| `npm run db:studio` | Open Prisma Studio to browse the database |

To reset the database from scratch:

```bash
rm -f dev.db
npx prisma migrate deploy
npm run db:seed
```

## Project structure

```
prisma/schema.prisma     Data model (Item, Vendor, Customer, Purchase, Sale)
prisma/seed.ts           Sample data seed script
src/app/                 Pages (dashboard, items, vendors, customers, purchases, sales)
src/app/api/             REST route handlers backing each page
src/components/ui/       Shared UI primitives (button, card, modal, table bits…)
src/components/layout/   Sidebar / mobile nav / app shell
src/lib/                 Prisma client, zod schemas, formatting helpers, fetch hook
```
