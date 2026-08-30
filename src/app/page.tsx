import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { HomeIndex } from "@/components/layout/home-index";
import { Hero } from "@/components/home/hero";
import { CaseIndex } from "@/components/home/case-index";
import { Protocol } from "@/components/home/protocol";
import { Grain } from "@/components/fx/atmosphere";

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <Grain />
      <SiteHeader />
      <HomeIndex />
      <main className="pt-11">
        <Hero />
        <CaseIndex />
        <Protocol />
      </main>
      <SiteFooter />
    </div>
  );
}
