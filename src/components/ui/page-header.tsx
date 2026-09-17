import type { ReactNode } from "react";
import Link from "next/link";
import { IconArrowLeft } from "@/components/icons";

export function PageHeader({
  title,
  description,
  action,
  back = true,
  backHref = "/",
  backLabel = "Dashboard",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  back?: boolean;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mb-6">
      {back ? (
        <Link
          href={backHref}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
        >
          <IconArrowLeft className="h-4 w-4" />
          Back to {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-muted">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
    </div>
  );
}
