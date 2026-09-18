import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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

const BRAND_PINK = "#ec1876";
const BRAND_PURPLE = "#7c3aed";
const INK = "#1f1a2e";
const MUTED = "#6b6480";
const BORDER = "#e6e1f2";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: INK,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  brand: {
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: BRAND_PINK,
  },
  tagline: {
    fontSize: 9,
    color: MUTED,
    marginTop: 2,
  },
  invoiceTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: BRAND_PURPLE,
    textAlign: "right",
  },
  metaLine: {
    fontSize: 9,
    color: MUTED,
    textAlign: "right",
    marginTop: 3,
  },
  section: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  customerName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginBottom: 2,
  },
  customerLine: {
    fontSize: 9.5,
    color: MUTED,
    marginBottom: 1,
  },
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#faf6ff",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  th: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
    textTransform: "uppercase",
  },
  td: {
    fontSize: 9.5,
  },
  colDate: { width: "14%" },
  colItem: { width: "36%" },
  colQty: { width: "14%", textAlign: "right" },
  colRate: { width: "14%", textAlign: "right" },
  colDiscount: { width: "10%", textAlign: "right" },
  colAmount: { width: "12%", textAlign: "right" },
  totalsBlock: {
    marginTop: 14,
    alignSelf: "flex-end",
    width: 220,
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
  },
  grandTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: INK,
  },
  grandTotalLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  grandTotalValue: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: BRAND_PINK,
  },
  footer: {
    position: "absolute",
    bottom: 36,
    left: 40,
    right: 40,
    textAlign: "center",
  },
  footerText: {
    fontSize: 9,
    color: MUTED,
  },
  footerBrand: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: BRAND_PURPLE,
    marginTop: 2,
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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>Hi Five by Jia</Text>
            <Text style={styles.tagline}>Handmade bracelets & accessories</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.metaLine}>{invoiceNumber}</Text>
            <Text style={styles.metaLine}>{formatDate(invoiceDate)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Billed to</Text>
          <Text style={styles.customerName}>{customer.name}</Text>
          {customer.phone ? <Text style={styles.customerLine}>{customer.phone}</Text> : null}
          {customer.email ? <Text style={styles.customerLine}>{customer.email}</Text> : null}
          {customer.address ? <Text style={styles.customerLine}>{customer.address}</Text> : null}
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
          {lines.map((line, i) => (
            <View
              key={i}
              style={i === lines.length - 1 ? [styles.tableRow, styles.tableRowLast] : styles.tableRow}
            >
              <Text style={[styles.td, styles.colDate]}>{formatDate(line.date)}</Text>
              <Text style={[styles.td, styles.colItem]}>{line.itemName}</Text>
              <Text style={[styles.td, styles.colQty]}>
                {line.quantity} {line.unit}
              </Text>
              <Text style={[styles.td, styles.colRate]}>{formatINR(line.rate)}</Text>
              <Text style={[styles.td, styles.colDiscount]}>
                {line.discount > 0 ? formatINR(line.discount) : "—"}
              </Text>
              <Text style={[styles.td, styles.colAmount]}>{formatINR(line.amount)}</Text>
            </View>
          ))}
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
          <View style={styles.grandTotalRow}>
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>{formatINR(grandTotal)}</Text>
          </View>
        </View>

        {paymentModes.length > 0 ? (
          <View style={{ marginTop: 16 }}>
            <Text style={styles.sectionLabel}>Payment mode</Text>
            <Text style={styles.customerLine}>{paymentModes.join(", ")}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for shopping handmade!</Text>
          <Text style={styles.footerBrand}>Hi Five by Jia</Text>
        </View>
      </Page>
    </Document>
  );
}
