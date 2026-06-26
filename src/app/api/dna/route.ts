import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EMPTY_DNA, type CampaignDNAData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FIELDS: (keyof CampaignDNAData)[] = [
  "businessName",
  "product",
  "idealCustomer",
  "valueProposition",
  "toneOfVoice",
  "objections",
  "proof",
  "competitors",
];

// POST /api/dna → cria/atualiza o DNA da Campanha de um nicho.
// body: { nicheId, ...campos do DNA }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nicheId = String(body?.nicheId ?? "");
    if (!nicheId) {
      return NextResponse.json({ error: "nicheId é obrigatório." }, { status: 400 });
    }

    const niche = await prisma.niche.findUnique({ where: { id: nicheId } });
    if (!niche) {
      return NextResponse.json({ error: "Nicho não encontrado." }, { status: 404 });
    }

    const values: CampaignDNAData = { ...EMPTY_DNA };
    for (const f of FIELDS) {
      if (typeof body[f] === "string") values[f] = body[f];
    }

    await prisma.campaignDNA.upsert({
      where: { nicheId },
      update: { ...values },
      create: { nicheId, ...values },
    });

    return NextResponse.json({ ok: true, dna: values });
  } catch (error) {
    console.error("POST /api/dna", error);
    return NextResponse.json(
      { error: "Não foi possível salvar o DNA da Campanha." },
      { status: 500 },
    );
  }
}
