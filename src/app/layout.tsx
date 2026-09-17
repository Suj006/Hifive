import type { Metadata } from "next";
import { Manrope, Baloo_2 } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeInitScript } from "@/components/theme/theme-init-script";

const bodyFont = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
});

const headingFont = Baloo_2({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Hi Five by Jia",
  description:
    "Purchase and sale ledger for Hi Five by Jia — handmade bracelets & accessories.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <ThemeInitScript />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
