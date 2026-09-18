import fs from "fs";
import path from "path";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

export interface InvoiceLine {
  date: string;
  itemName: string;
  unit: string;
  quantity: number;
  rate: number;
  discount: number;
  amount: number;
}

export interface InvoiceCustomer {
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

// Brand palette, straight from the logo (see public/logo.jpeg): pink, purple,
// teal and gold. The four-color strip at the top/bottom of the page is a
// deliberate echo of the logo's own hand/bracelet artwork.
const PINK = "#ec1876";
const PURPLE = "#7b2ff7";
const TEAL = "#0d95a3";
const GOLD = "#b8790a";
const INK = "#211a35";
const MUTED = "#6f6885";
const BORDER = "#e7e1f5";
const SURFACE = "#faf8ff";

let logoDataUri: string | null = null;
try {
  const logoPath = path.join(process.cwd(), "public", "logo.jpeg");
  logoDataUri = `data:image/jpeg;base64,${fs.readFileSync(logoPath).toString("base64")}`;
} catch {
  logoDataUri = null;
}

const styles = StyleSheet.create({
  page: {
    fontSize: 10,
    fontFamily: "Helvetica",
    color: INK,
  },
  colorStrip: {
    flexDirection: "row",
    height: 6,
  },
  stripPink: { flex: 1, backgroundColor: PINK },
  stripPurple: { flex: 1, backgroundColor: PURPLE },
  stripTeal: { flex: 1, backgroundColor: TEAL },
  stripGold: { flex: 1, backgroundColor: GOLD },

  body: {
    paddingHorizontal: 40,
    paddingTop: 28,
    paddingBottom: 90,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 18,
    borderBottomWidth: 1.5,
    borderBottomColor: BORDER,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  brandText: {
    marginLeft: 12,
  },
  brand: {
    fontSize: 19,
    fontFamily: "Helvetica-Bold",
    color: PINK,
  },
  tagline: {
    fontSize: 8.5,
    color: MUTED,
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: PURPLE,
    textAlign: "right",
    letterSpacing: 1,
  },
  invoiceMetaBox: {
    marginTop: 8,
    alignItems: "flex-end",
  },
  invoiceMetaRow: {
    flexDirection: "row",
    marginTop: 2,
  },
  invoiceMetaLabel: {
    fontSize: 8.5,
    color: MUTED,
    marginRight: 6,
  },
  invoiceMetaValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: INK,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    marginBottom: 22,
  },
  infoBlock: {
    width: "47%",
  },
  infoLabel: {
    fontSize: 8,
    color: PURPLE,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  customerName: {
    fontSize: 12.5,
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  infoLine: {
    fontSize: 9.5,
    color: MUTED,
    marginBottom: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  summaryLabel: {
    fontSize: 9.5,
    color: MUTED,
  },
  summaryValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: INK,
  },

  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: PURPLE,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tableRowAlt: {
    backgroundColor: SURFACE,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  th: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  td: {
    fontSize: 9.5,
  },
  tdMuted: {
    fontSize: 9.5,
    color: MUTED,
  },
  colDate: { width: "14%" },
  colItem: { width: "34%" },
  colQty: { width: "15%", textAlign: "right" },
  colRate: { width: "13%", textAlign: "right" },
  colDiscount: { width: "12%", textAlign: "right" },
  colAmount: { width: "12%", textAlign: "right" },

  totalsSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 18,
  },
  paymentBlock: {
    width: "47%",
  },
  paymentChip: {
    alignSelf: "flex-start",
    backgroundColor: SURFACE,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 9,
    marginTop: 2,
  },
  paymentChipText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: TEAL,
  },
  totalsBlock: {
    width: 200,
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  totalsLabel: {
    fontSize: 9.5,
    color: MUTED,
  },
  totalsValue: {
    fontSize: 9.5,
    color: INK,
  },
  grandTotalBand: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: PINK,
    borderRadius: 4,
  },
  grandTotalLabel: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  grandTotalValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },

  footer: {
    position: "absolute",
    bottom: 34,
    left: 40,
    right: 40,
  },
  footerDivider: {
    borderTopWidth: 1,
    borderTopColor: BORDER,
    marginBottom: 10,
  },
  footerThanks: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: INK,
    textAlign: "center",
  },
  footerTagline: {
    fontSize: 8.5,
    color: MUTED,
    textAlign: "center",
    marginTop: 2,
  },
  footerNote: {
    fontSize: 7,
    color: MUTED,
    textAlign: "center",
    marginTop: 6,
  },
});

function formatINR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function SalesInvoiceDocument({
  invoiceNumber,
  invoiceDate,
  customer,
  lines,
  paymentModes,
}: {
  invoiceNumber: string;
  invoiceDate: string;
  customer: InvoiceCustomer;
  lines: InvoiceLine[];
  paymentModes: string[];
}) {
  const subtotal = lines.reduce((s, l) => s + l.quantity * l.rate, 0);
  const totalDiscount = lines.reduce((s, l) => s + l.discount, 0);
  const grandTotal = lines.reduce((s, l) => s + l.amount, 0);
  const totalQty = lines.reduce((s, l) => s + l.quantity, 0);

  return (
    <Document title={`Invoice ${invoiceNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.colorStrip}>
          <View style={styles.stripPink} />
          <View style={styles.stripPurple} />
          <View style={styles.stripTeal} />
          <View style={styles.stripGold} />
        </View>

        <View style={styles.body}>
          <View style={styles.headerRow}>
            <View style={styles.brandRow}>
              {logoDataUri ? (
                // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image renders into a PDF, not the DOM; it has no `alt` prop.
                <Image src={logoDataUri} style={styles.logo} />
              ) : null}
              <View style={styles.brandText}>
                <Text style={styles.brand}>Hi Five by Jia</Text>
                <Text style={styles.tagline}>Handmade bracelets & accessories</Text>
                <Text style={styles.tagline}>Handmade with love, made for you</Text>
              </View>
            </View>
            <View>
              <Text style={styles.invoiceTitle}>INVOICE</Text>
              <View style={styles.invoiceMetaBox}>
                <View style={styles.invoiceMetaRow}>
                  <Text style={styles.invoiceMetaLabel}>Invoice No.</Text>
                  <Text style={styles.invoiceMetaValue}>{invoiceNumber}</Text>
                </View>
                <View style={styles.invoiceMetaRow}>
                  <Text style={styles.invoiceMetaLabel}>Date</Text>
                  <Text style={styles.invoiceMetaValue}>{formatDate(invoiceDate)}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Billed To</Text>
              <Text style={styles.customerName}>{customer.name}</Text>
              {customer.phone ? <Text style={styles.infoLine}>{customer.phone}</Text> : null}
              {customer.email ? <Text style={styles.infoLine}>{customer.email}</Text> : null}
              {customer.address ? <Text style={styles.infoLine}>{customer.address}</Text> : null}
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items</Text>
                <Text style={styles.summaryValue}>{lines.length}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total quantity</Text>
                <Text style={styles.summaryValue}>{totalQty}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Sale date range</Text>
                <Text style={styles.summaryValue}>
                  {formatDate(lines[0].date)}
                  {lines.length > 1 && lines[0].date !== lines[lines.length - 1].date
                    ? ` – ${formatDate(lines[lines.length - 1].date)}`
                    : ""}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, styles.colDate]}>Date</Text>
              <Text style={[styles.th, styles.colItem]}>Item</Text>
              <Text style={[styles.th, styles.colQty]}>Qty</Text>
              <Text style={[styles.th, styles.colRate]}>Rate</Text>
              <Text style={[styles.th, styles.colDiscount]}>Discount</Text>
              <Text style={[styles.th, styles.colAmount]}>Amount</Text>
            </View>
            {lines.map((line, i) => {
              const rowStyle = [
                styles.tableRow,
                i % 2 === 1 ? styles.tableRowAlt : null,
                i === lines.length - 1 ? styles.tableRowLast : null,
              ].filter((s): s is NonNullable<typeof s> => s !== null);
              return (
                <View key={i} style={rowStyle}>
                  <Text style={[styles.td, styles.colDate]}>{formatDate(line.date)}</Text>
                  <Text style={[styles.td, styles.colItem]}>{line.itemName}</Text>
                  <Text style={[styles.td, styles.colQty]}>
                    {line.quantity} {line.unit}
                  </Text>
                  <Text style={[styles.tdMuted, styles.colRate]}>{formatINR(line.rate)}</Text>
                  <Text style={[styles.tdMuted, styles.colDiscount]}>
                    {line.discount > 0 ? formatINR(line.discount) : "—"}
                  </Text>
                  <Text style={[styles.td, styles.colAmount]}>{formatINR(line.amount)}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.totalsSection}>
            <View style={styles.paymentBlock}>
              {paymentModes.length > 0 ? (
                <>
                  <Text style={styles.infoLabel}>Payment Mode</Text>
                  <View style={styles.paymentChip}>
                    <Text style={styles.paymentChipText}>{paymentModes.join(", ")}</Text>
                  </View>
                </>
              ) : null}
            </View>
            <View style={styles.totalsBlock}>
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Subtotal</Text>
                <Text style={styles.totalsValue}>{formatINR(subtotal)}</Text>
              </View>
              {totalDiscount > 0 ? (
                <View style={styles.totalsRow}>
                  <Text style={styles.totalsLabel}>Discount</Text>
                  <Text style={styles.totalsValue}>-{formatINR(totalDiscount)}</Text>
                </View>
              ) : null}
              <View style={styles.grandTotalBand}>
                <Text style={styles.grandTotalLabel}>Total</Text>
                <Text style={styles.grandTotalValue}>{formatINR(grandTotal)}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerThanks}>Thank you for shopping handmade!</Text>
          <Text style={styles.footerTagline}>Hi Five by Jia · Handmade with love, made for you</Text>
          <Text style={styles.footerNote}>This is a system-generated invoice.</Text>
        </View>

        <View style={[styles.colorStrip, { position: "absolute", bottom: 0, left: 0, right: 0 }]}>
          <View style={styles.stripGold} />
          <View style={styles.stripTeal} />
          <View style={styles.stripPurple} />
          <View style={styles.stripPink} />
        </View>
      </Page>
    </Document>
  );
}
