-- Coupon gains a validity window (existing coupons are treated as starting
-- now, with no expiry, so they keep working exactly as before) and a
-- once-per-customer limit flag.
ALTER TABLE "Coupon" ADD COLUMN "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Coupon" ADD COLUMN "endDate" DATETIME;
ALTER TABLE "Coupon" ADD COLUMN "oncePerCustomer" BOOLEAN NOT NULL DEFAULT false;
