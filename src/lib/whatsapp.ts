// wa.me "click to chat" links can only pre-fill a text message — WhatsApp
// gives no URL-based way to attach a file, so the invoice PDF still has to
// be attached by hand once the chat opens. This just gets the right chat
// open with a ready-to-send message, instead of looking up the number.
export function toWhatsAppLink(phone: string, message: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 8) return null;
  // A bare 10-digit Indian mobile number (no country code) — assume +91,
  // since every figure in this app is already INR-only.
  const withCountryCode = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}
