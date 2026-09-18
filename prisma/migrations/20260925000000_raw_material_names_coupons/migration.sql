-- Raw Material Name master (mirrors ProductName), a Coupon master, and
-- Sale gains a discountType (FLAT/PERCENT, defaulting existing rows to FLAT
-- so their existing rupee-denominated discount values keep their meaning)
-- plus coupon fields.

CREATE TABLE "RawMaterialName" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "RawMaterialName_name_key" ON "RawMaterialName"("name");

CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "maxDiscount" REAL,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "date" DATETIME NOT NULL,
    "itemId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "amountPaid" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "discountType" TEXT NOT NULL DEFAULT 'FLAT',
    "couponId" TEXT,
    "couponCode" TEXT,
    "couponDiscount" REAL NOT NULL DEFAULT 0,
    "invoiceNumber" TEXT,
    "paymentMode" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Sale_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Sale" ("id","date","itemId","customerId","quantity","rate","amount","amountPaid","discount","discountType","couponId","couponCode","couponDiscount","invoiceNumber","paymentMode","notes","createdAt","updatedAt")
SELECT "id","date","itemId","customerId","quantity","rate","amount","amountPaid","discount",'FLAT',NULL,NULL,0,"invoiceNumber","paymentMode","notes","createdAt","updatedAt"
FROM "Sale";
DROP TABLE "Sale";
ALTER TABLE "new_Sale" RENAME TO "Sale";
CREATE INDEX "Sale_itemId_idx" ON "Sale"("itemId");
CREATE INDEX "Sale_customerId_idx" ON "Sale"("customerId");
CREATE INDEX "Sale_date_idx" ON "Sale"("date");
CREATE INDEX "Sale_couponId_idx" ON "Sale"("couponId");
PRAGMA foreign_keys=ON;
