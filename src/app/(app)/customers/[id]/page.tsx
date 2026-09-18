"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useApi } from "@/lib/use-api";
import { formatDate, formatINR, formatNumber } from "@/lib/format";
import { toWhatsAppLink } from "@/lib/whatsapp";
import type { Customer, Sale } from "@/lib/types";
import {
  IconUsers,
  IconTag,
  IconRupee,
  IconWallet,
  IconCalendar,
  IconWhatsApp,
} from "@/components/icons";

export default function CustomerProfilePage() {
  const params = useParams<{ id: string }>();
  const customerId = params.id;

  const { data: customers, loading: customersLoading } = useApi<Customer[]>("/api/customers");
  const { data: sales, loading: salesLoading } = useApi<Sale[]>(
    `/api/sales?customerId=${customerId}`
  );

  const customer = customers?.find((c) => c.id === customerId) ?? null;

  const stats = useMemo(() => {
    const list = sales ?? [];
    const totalSpent = list.reduce((s, sale) => s + sale.amount, 0);
    const totalDue = list.reduce((s, sale) => s + Math.max(0, sale.amount - sale.amountPaid), 0);
    const lastOrder = list[0]?.date ?? null; // API already orders by date desc
    return { totalSpent, totalDue, orders: list.length, lastOrder };
  }, [sales]);

  const whatsAppLink = customer?.phone
    ? toWhatsAppLink(customer.phone, `Hi ${customer.name}, this is Hi Five by Jia! `)
    : null;

  const loading = customersLoading || salesLoading;

  return (
    <div>
      <PageHeader
        title={customer?.name ?? "Customer"}
        description="Purchase history and lifetime stats."
        backHref="/customers"
        backLabel="Customers"
        action={
          whatsAppLink ? (
            <Button
              variant="secondary"
              onClick={() => window.open(whatsAppLink, "_blank", "noopener,noreferrer")}
            >
              <IconWhatsApp className="h-4 w-4" /> Message on WhatsApp
            </Button>
          ) : undefined
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl border border-border bg-surface-2/50"
            />
          ))}
        </div>
      ) : !customer ? (
        <Card>
          <EmptyState
            icon={<IconUsers className="h-6 w-6 text-brand-purple-2" />}
            title="Customer not found"
            description="This customer may have been removed."
          />
        </Card>
      ) : (
        <>
          <Card className="mb-6 overflow-hidden">
            <CardContent className="flex flex-col gap-1.5 pt-5">
              {customer.phone ? <p className="text-sm text-muted">{customer.phone}</p> : null}
              {customer.email ? <p className="text-sm text-muted">{customer.email}</p> : null}
              {customer.address ? <p className="text-sm text-muted">{customer.address}</p> : null}
              {customer.notes ? (
                <p className="mt-1 text-sm text-muted">
                  <span className="font-medium text-foreground">Notes: </span>
                  {customer.notes}
                </p>
              ) : null}
              <div className="mt-2">
                {customer.isActive ? (
                  <Badge tone="success">Active</Badge>
                ) : (
                  <Badge tone="neutral">Inactive</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total Spent"
              value={formatINR(stats.totalSpent)}
              icon={<IconRupee className="h-5 w-5" />}
              accent="pink"
            />
            <StatCard
              label="Orders"
              value={String(stats.orders)}
              icon={<IconTag className="h-5 w-5" />}
              accent="purple"
            />
            <StatCard
              label="Outstanding Due"
              value={formatINR(stats.totalDue)}
              icon={<IconWallet className="h-5 w-5" />}
              accent="gold"
            />
            <StatCard
              label="Last Order"
              value={stats.lastOrder ? formatDate(stats.lastOrder) : "—"}
              icon={<IconCalendar className="h-5 w-5" />}
              accent="teal"
            />
          </div>

          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Purchase history</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {!sales || sales.length === 0 ? (
                <EmptyState
                  icon={<IconTag className="h-6 w-6 text-brand-pink-2" />}
                  title="No purchases yet"
                  description="Sales recorded for this customer will show up here."
                />
              ) : (
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full min-w-[760px] text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium">Product</th>
                        <th className="px-5 py-3 font-medium text-right">Qty</th>
                        <th className="px-5 py-3 font-medium text-right">Amount</th>
                        <th className="px-5 py-3 font-medium text-right">Due</th>
                        <th className="px-5 py-3 font-medium">Payment</th>
                        <th className="px-5 py-3 font-medium">Invoice No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sales.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-border/60 last:border-0 hover:bg-white/[0.02]"
                        >
                          <td className="px-5 py-3.5 whitespace-nowrap text-muted">
                            {formatDate(s.date)}
                          </td>
                          <td className="px-5 py-3.5 font-medium">{s.item.name}</td>
                          <td className="px-5 py-3.5 text-right">
                            {formatNumber(s.quantity)} {s.item.unit}
                          </td>
                          <td className="px-5 py-3.5 text-right font-semibold">
                            {formatINR(s.amount)}
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            {s.amount - s.amountPaid > 0 ? (
                              <Badge tone="gold">{formatINR(s.amount - s.amountPaid)}</Badge>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            {s.paymentMode ? (
                              <Badge tone="teal">{s.paymentMode}</Badge>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-5 py-3.5 whitespace-nowrap font-mono text-xs text-muted">
                            {s.invoiceNumber ?? "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
