import type { Metadata } from "next";
import { CaseTransitionProvider } from "@/components/transitions/case-transition-provider";
import "@fontsource/cinzel-decorative/700.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/new-rocker/400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "TRACE — Cybercrime Investigation Challenge",
  description: "Track. Retrieve. Analyze. Correlate. Examine.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><CaseTransitionProvider>{children}</CaseTransitionProvider></body>
    </html>
  );
}
