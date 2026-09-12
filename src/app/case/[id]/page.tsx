import { notFound } from "next/navigation";
import { CaseExperience } from "@/components/case/case-experience";
import { getCase } from "@/data/trace";

export const dynamic = "force-dynamic";

export default async function CasePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const traceCase = getCase(id);
  if (!traceCase) notFound();
  return <CaseExperience traceCase={traceCase} />;
}
