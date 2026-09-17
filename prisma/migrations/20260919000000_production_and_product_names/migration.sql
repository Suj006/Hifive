-- CreateTable
CREATE TABLE "ProductName" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductName_name_key" ON "ProductName"("name");

-- CreateTable
CREATE TABLE "Production" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Production_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Production_itemId_idx" ON "Production"("itemId");

-- CreateIndex
CREATE INDEX "Production_date_idx" ON "Production"("date");

-- Backfill: register a ProductName master entry for every distinct product
-- already in use, so existing items keep working with the new dropdown.
-- (DISTINCT is applied in the inner query only, on name — the outer query
-- then generates one random id per distinct name.)
INSERT INTO "ProductName" ("id", "name", "isActive", "createdAt")
SELECT lower(hex(randomblob(16))), "name", true, CURRENT_TIMESTAMP
FROM (SELECT DISTINCT "name" FROM "Item" WHERE "type" = 'PRODUCT');
