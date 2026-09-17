import Script from "next/script";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

export function ThemeInitScript() {
  return (
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- App Router's root layout is the documented place for beforeInteractive scripts; this rule only applies to the Pages Router's _document.js.
    <Script
      id="hifive-theme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
    />
  );
}
