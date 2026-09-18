-- Add a system-generated, human-readable code to every Vendor and Customer
-- (VEND-0001 / CUST-0001, numbered by insertion order — same scheme as Item
-- codes), so each party has a stable ID to reference in reports and
-- conversation on top of its internal id. Customer also gains a unique phone
-- (no two customers may share one number) and month/day-only date of birth
-- (no year, so age can't be derived — collected for birthday marketing only).

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vendor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Vendor" ("id","code","name","phone","email","address","notes","isActive","createdAt","updatedAt")
SELECT
  "id",
  'VEND-' || substr('0000' || "rowid", -4, 4),
  "name",
  "phone",
  "email",
  "address",
  "notes",
  "isActive",
  "createdAt",
  "updatedAt"
FROM "Vendor";
DROP TABLE "Vendor";
ALTER TABLE "new_Vendor" RENAME TO "Vendor";
CREATE UNIQUE INDEX "Vendor_code_key" ON "Vendor"("code");
CREATE UNIQUE INDEX "Vendor_name_key" ON "Vendor"("name");

CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "dobMonth" INTEGER,
    "dobDay" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Customer" ("id","code","name","phone","email","address","notes","dobMonth","dobDay","isActive","createdAt","updatedAt")
SELECT
  "id",
  'CUST-' || substr('0000' || "rowid", -4, 4),
  "name",
  "phone",
  "email",
  "address",
  "notes",
  NULL,
  NULL,
  "isActive",
  "createdAt",
  "updatedAt"
FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_code_key" ON "Customer"("code");
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
PRAGMA foreign_keys=ON;
