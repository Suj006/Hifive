import { cn } from "@/lib/cn";

// A dedicated, purpose-built layout for the PNG export — deliberately NOT a
// screenshot of the live dark-glassmorphic UI. That live UI relies on
// backdrop-filter blur and decorative gradient glows that html-to-image's
// canvas rasterization renders unreliably (hazy/blank patches), and a
// screenshot would also capture the CSV/PNG action buttons themselves. This
// light, print-style template avoids both problems and reads as an actual
// report document — matching the branding used on the invoice PDF.

const PINK = "#ec1876";
const PURPLE = "#7b2ff7";
const TEAL = "#0d95a3";
const GOLD = "#b8790a";
const INK = "#211a35";
const MUTED = "#6f6885";
const BORDER = "#e7e1f5";
const SURFACE = "#faf8ff";

const FONT_STACK =
  "Arial, 'Helvetica Neue', Helvetica, sans-serif";

export interface ExportColumn {
  key: string;
  label: string;
  align?: "right";
  format?: (value: unknown) => string;
}

export interface ExportTableSpec {
  title: string;
  countLabel: string;
  columns: ExportColumn[];
  rows: Record<string, unknown>[];
  emptyText: string;
}

export interface ExportStat {
  label: string;
  value: string;
}

function columnWidths(columns: ExportColumn[]): string[] {
  const weights = columns.map((c) => (c.align === "right" ? 1 : 2));
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => `${((w / total) * 100).toFixed(2)}%`);
}

function ColorStrip() {
  return (
    <div style={{ display: "flex", height: 5 }}>
      <div style={{ flex: 1, background: PINK }} />
      <div style={{ flex: 1, background: PURPLE }} />
      <div style={{ flex: 1, background: TEAL }} />
      <div style={{ flex: 1, background: GOLD }} />
    </div>
  );
}

function ReportDataTable({ spec }: { spec: ExportTableSpec }) {
  const widths = columnWidths(spec.columns);
  return (
    <div style={{ marginBottom: 28 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 700, color: INK }}>{spec.title}</span>
        <span style={{ fontSize: 10, color: MUTED }}>{spec.countLabel}</span>
      </div>
      {spec.rows.length === 0 ? (
        <div
          style={{
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            padding: "16px 14px",
            fontSize: 10.5,
            color: MUTED,
          }}
        >
          {spec.emptyText}
        </div>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            tableLayout: "fixed",
            border: `1px solid ${BORDER}`,
            borderRadius: 6,
            overflow: "hidden",
          }}
        >
          <thead>
            <tr style={{ background: PURPLE }}>
              {spec.columns.map((c, i) => (
                <th
                  key={c.key}
                  style={{
                    width: widths[i],
                    textAlign: c.align === "right" ? "right" : "left",
                    fontSize: 8.5,
                    fontWeight: 700,
                    color: "#ffffff",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                    padding: "8px 10px",
                  }}
                >
                  {c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spec.rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 === 1 ? SURFACE : "#ffffff" }}>
                {spec.columns.map((c) => (
                  <td
                    key={c.key}
                    style={{
                      textAlign: c.align === "right" ? "right" : "left",
                      fontSize: 10.5,
                      color: INK,
                      padding: "8px 10px",
                      borderTop: `1px solid ${BORDER}`,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {c.format ? c.format(row[c.key]) : String(row[c.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export function ReportExportView({
  reportTitle,
  generatedAt,
  filtersSummary,
  stats,
  tables,
  className,
}: {
  reportTitle: string;
  generatedAt: Date;
  filtersSummary: string | null;
  stats?: ExportStat[];
  tables: ExportTableSpec[];
  className?: string;
}) {
  const generatedLabel = generatedAt.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(className)}
      style={{
        width: 980,
        background: "#ffffff",
        fontFamily: FONT_STACK,
        color: INK,
      }}
    >
      <ColorStrip />
      <div style={{ padding: "28px 40px 36px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            paddingBottom: 16,
            borderBottom: `1.5px solid ${BORDER}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- captured by html-to-image, which needs a plain <img> (not next/image) to inline it reliably */}
            <img
              src="/logo.jpeg"
              alt=""
              width={48}
              height={48}
              style={{ borderRadius: 24, display: "block" }}
              crossOrigin="anonymous"
            />
            <div style={{ marginLeft: 12 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: PINK }}>Hi Five by Jia</div>
              <div style={{ fontSize: 8.5, color: MUTED, marginTop: 2 }}>
                Handmade bracelets & accessories
              </div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                color: PURPLE,
                letterSpacing: 1,
              }}
            >
              REPORT
            </div>
            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 3 }}>{reportTitle}</div>
            <div style={{ fontSize: 8.5, color: MUTED, marginTop: 2 }}>
              Generated {generatedLabel}
            </div>
            {filtersSummary ? (
              <div style={{ fontSize: 8.5, color: MUTED, marginTop: 2 }}>{filtersSummary}</div>
            ) : null}
          </div>
        </div>

        {stats && stats.length > 0 ? (
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 18,
              marginBottom: 6,
            }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  border: `1px solid ${BORDER}`,
                  borderRadius: 6,
                  padding: "10px 12px",
                  background: SURFACE,
                }}
              >
                <div
                  style={{
                    fontSize: 7.5,
                    color: MUTED,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: INK, marginTop: 3 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div style={{ marginTop: 22 }}>
          {tables.map((t, i) => (
            <ReportDataTable key={i} spec={t} />
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 10, marginTop: 6 }}>
          <div style={{ fontSize: 9, textAlign: "center", color: MUTED }}>
            Hi Five by Jia · Handmade with love, made for you
          </div>
        </div>
      </div>
      <ColorStrip />
    </div>
  );
}
