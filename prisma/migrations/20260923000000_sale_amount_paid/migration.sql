-- Add amountPaid to Sale, then backfill existing rows as fully paid so no
-- historical sale suddenly appears to have an outstanding due.
ALTER TABLE "Sale" ADD COLUMN "amountPaid" REAL NOT NULL DEFAULT 0;

UPDATE "Sale" SET "amountPaid" = "amount";
