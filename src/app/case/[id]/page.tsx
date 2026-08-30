import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCase, listCaseIds, listEvidence } from "@/data";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { CaseHeader } from "@/components/case/case-header";
import { CaseBriefing } from "@/components/case/case-briefing";
import { CaseWorkspace } from "@/components/case/case-workspace";
import { LockedCase } from "@/components/case/locked-case";
import { Grain } from "@/components/fx/atmosphere";

export function generateStaticParams() {
  return listCaseIds().map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const record = getCase(id);
  if (!record) return { title: "TRACE — Dossier not found" };
  return {
    title: `${record.code} — ${record.title} · TRACE`,
    description: record.subtitle,
  };
}

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = getCase(id);
  if (!record) notFound();

  const sealed = record.releaseStatus !== "released";
  const evidence = sealed ? [] : listEvidence(record.id);

  return (
    <div className="relative min-h-screen">
      <Grain />
      <SiteHeader contextLabel={record.code} />

      <main className="pt-11">
        {sealed ? (
          <>
            <LockedCase record={record} />
          </>
        ) : (
          <>
            <CaseHeader record={record} />
            <CaseBriefing record={record} />
            <CaseWorkspace record={record} evidence={evidence} />
          </>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
