import type { Metadata, Viewport } from "next";
import { Anton, Archivo, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const display = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const heading = Archivo({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-heading",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TRACE — Track · Retrieve · Analyze · Correlate · Examine",
  description:
    "A cybercrime investigation challenge run by the Ministry of Magic. Inspect authentic digital evidence, correlate artefacts across sources, and reconstruct what happened.",
  applicationName: "TRACE",
  keywords: ["TRACE", "cybercrime", "digital forensics", "CTF", "investigation"],
  openGraph: {
    title: "TRACE — Every artifact leaves a trace.",
    description: "Ministry of Magic · Department of Magical Law Enforcement · Cybercrime Investigation Exercise",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090A",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${display.variable} ${heading.variable} ${sans.variable} ${mono.variable} min-h-screen bg-ink-900`}
      >
        <TooltipProvider delayDuration={250} skipDelayDuration={400}>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
