import { notFound } from "next/navigation";
import { CaseExperience } from "@/components/case/case-experience";
import { getCase } from "@/data/trace";
import { getCase05Evidence } from "@/lib/case-05-evidence";

export const dynamic = "force-dynamic";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const traceCase = getCase(id);
  if (!traceCase) notFound();
  const evidence = traceCase.id === "1" ? await getCase05Evidence() : traceCase.evidence;
  return <CaseExperience traceCase={{ ...traceCase, evidence }} />;
}
