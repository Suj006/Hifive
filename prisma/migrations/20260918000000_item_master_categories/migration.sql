-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "group" TEXT,
    "categoryId" TEXT,
    "variantKey" TEXT NOT NULL,
    "openingStock" REAL NOT NULL DEFAULT 0,
    "reorderLevel" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
-- Backfill: every existing item gets a unique auto code (RM-#### / PD-####, numbered
-- by insertion order) and a unique dedupe key. Legacy rows that happened to share a
-- name are disambiguated with their row id so the migration can never fail on
-- pre-existing duplicates; new rows created going forward get clean keys from the app.
INSERT INTO "new_Item" ("id","code","name","type","unit","group","categoryId","variantKey","openingStock","reorderLevel","notes","isActive","createdAt","updatedAt")
SELECT
  "id",
  (CASE WHEN "type" = 'RAW_MATERIAL' THEN 'RM-' ELSE 'PD-' END) || substr('0000' || "rowid", -4, 4),
  "name",
  "type",
  "unit",
  "category",
  NULL,
  lower(trim("name")) || '|' || "type" || '|' || '#' || "id",
  "openingStock",
  "reorderLevel",
  "notes",
  "isActive",
  "createdAt",
  "updatedAt"
FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE UNIQUE INDEX "Item_code_key" ON "Item"("code");
CREATE UNIQUE INDEX "Item_variantKey_key" ON "Item"("variantKey");
CREATE INDEX "Item_type_idx" ON "Item"("type");
CREATE INDEX "Item_categoryId_idx" ON "Item"("categoryId");
PRAGMA foreign_keys=ON;
