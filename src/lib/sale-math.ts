export type DiscountType = "FLAT" | "PERCENT";

// The manual discount value is either a rupee amount or a percentage of the
// subtotal (quantity*rate), depending on discountType — this converts it to
// a rupee amount, clamped so a discount can never exceed the subtotal.
export function manualDiscountAmount(
  subtotal: number,
  discountType: DiscountType,
  discountValue: number
): number {
  const raw = discountType === "PERCENT" ? (subtotal * discountValue) / 100 : discountValue;
  return Math.min(Math.max(0, subtotal), Math.max(0, raw));
}

export interface CouponLike {
  discountType: DiscountType;
  value: number;
  maxDiscount: number | null;
}

// A coupon's rupee value for a given subtotal — a PERCENT coupon is capped
// at maxDiscount when set (e.g. "10% off, up to ₹500").
export function couponDiscountAmount(subtotal: number, coupon: CouponLike): number {
  const raw = coupon.discountType === "PERCENT" ? (subtotal * coupon.value) / 100 : coupon.value;
  const capped =
    coupon.discountType === "PERCENT" && coupon.maxDiscount != null
      ? Math.min(raw, coupon.maxDiscount)
      : raw;
  return Math.min(Math.max(0, subtotal), Math.max(0, capped));
}

export interface CouponWindow {
  startDate: Date | string;
  endDate: Date | string | null;
}

// Whether a coupon is valid on a given date — checked against the sale's own
// (possibly backdated) date, not "today".
export function isCouponValidForDate(coupon: CouponWindow, date: Date | string): boolean {
  const d = new Date(date).getTime();
  if (d < new Date(coupon.startDate).getTime()) return false;
  if (coupon.endDate != null && d > new Date(coupon.endDate).getTime()) return false;
  return true;
}
