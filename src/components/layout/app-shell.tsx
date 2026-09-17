"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { MobileTopBar, MobileTabBar } from "@/components/layout/mobile-nav";
import { ToastProvider } from "@/components/ui/toast";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        <Sidebar />
        <div className="flex min-h-dvh flex-1 flex-col">
          <MobileTopBar />
          <main className="flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-10">
            {children}
          </main>
          <MobileTabBar />
        </div>
      </div>
    </ToastProvider>
  );
}
