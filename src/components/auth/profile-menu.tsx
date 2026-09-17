"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";
import { useApi } from "@/lib/use-api";
import { IconUser, IconLock, IconLogout, IconChevronDown } from "@/components/icons";
import { ChangePasswordModal } from "@/components/auth/change-password-modal";

function useProfileMenu(rootRef: RefObject<HTMLDivElement | null>) {
  const { data } = useApi<{ username: string }>("/api/auth/me");
  const [open, setOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, rootRef]);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return {
    username: data?.username ?? "",
    open,
    setOpen,
    changePasswordOpen,
    setChangePasswordOpen,
    loggingOut,
    handleLogout,
  };
}

function MenuPanel({
  onChangePassword,
  onLogout,
  loggingOut,
}: {
  onChangePassword: () => void;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  return (
    <>
      <button
        onClick={onChangePassword}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-white/5 cursor-pointer"
      >
        <IconLock className="h-4 w-4 text-muted" />
        Change password
      </button>
      <button
        onClick={onLogout}
        disabled={loggingOut}
        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-danger transition-colors hover:bg-danger/10 cursor-pointer disabled:opacity-50"
      >
        <IconLogout className="h-4 w-4" />
        {loggingOut ? "Signing out…" : "Logout"}
      </button>
    </>
  );
}

/** Sidebar variant: full-width row, name + "Signed in", dropdown opens upward. */
export function ProfileMenu({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const m = useProfileMenu(rootRef);
  const initial = m.username ? m.username.charAt(0).toUpperCase() : "…";

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        onClick={() => m.setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-left transition-colors hover:border-brand-purple-2/60 cursor-pointer"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[image:var(--gradient-brand)] text-sm font-bold text-white">
          {initial}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">
            {m.username || "…"}
          </span>
          <span className="block text-xs text-muted">Signed in</span>
        </span>
        <IconChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted transition-transform",
            m.open && "rotate-180"
          )}
        />
      </button>

      {m.open ? (
        <div className="absolute bottom-full left-0 z-30 mb-2 w-full overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          <MenuPanel
            onChangePassword={() => {
              m.setOpen(false);
              m.setChangePasswordOpen(true);
            }}
            onLogout={m.handleLogout}
            loggingOut={m.loggingOut}
          />
        </div>
      ) : null}

      <ChangePasswordModal
        open={m.changePasswordOpen}
        onClose={() => m.setChangePasswordOpen(false)}
      />
    </div>
  );
}

/** Mobile top-bar variant: avatar-only trigger, dropdown opens downward. */
export function ProfileAvatarButton() {
  const rootRef = useRef<HTMLDivElement>(null);
  const m = useProfileMenu(rootRef);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => m.setOpen((o) => !o)}
        aria-label="Profile"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[image:var(--gradient-brand)] text-sm font-bold text-white cursor-pointer"
      >
        {m.username ? m.username.charAt(0).toUpperCase() : <IconUser className="h-4 w-4" />}
      </button>

      {m.open ? (
        <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-xl">
          <div className="border-b border-border px-3.5 py-2.5">
            <p className="truncate text-sm font-semibold">{m.username || "…"}</p>
            <p className="text-xs text-muted">Signed in</p>
          </div>
          <MenuPanel
            onChangePassword={() => {
              m.setOpen(false);
              m.setChangePasswordOpen(true);
            }}
            onLogout={m.handleLogout}
            loggingOut={m.loggingOut}
          />
        </div>
      ) : null}

      <ChangePasswordModal
        open={m.changePasswordOpen}
        onClose={() => m.setChangePasswordOpen(false)}
      />
    </div>
  );
}
