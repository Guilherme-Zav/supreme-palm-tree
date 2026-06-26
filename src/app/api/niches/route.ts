import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EMPTY_DNA, type NicheData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/niches → lista todos os nichos com DNA e agentes favoritos.
export async function GET() {
  try {
    const niches = await prisma.niche.findMany({
      orderBy: { createdAt: "asc" },
      include: { dna: true, favorites: true },
    });

    const data: NicheData[] = niches.map((n) => ({
      id: n.id,
      slug: n.slug,
      name: n.name,
      emoji: n.emoji,
      accentColor: n.accentColor,
      dna: n.dna
        ? {
            businessName: n.dna.businessName,
            product: n.dna.product,
            idealCustomer: n.dna.idealCustomer,
            valueProposition: n.dna.valueProposition,
            toneOfVoice: n.dna.toneOfVoice,
            objections: n.dna.objections,
            proof: n.dna.proof,
            competitors: n.dna.competitors,
          }
        : { ...EMPTY_DNA },
      favoriteAgentIds: n.favorites.map((f) => f.agentId),
    }));

    return NextResponse.json({ niches: data });
  } catch (error) {
    console.error("GET /api/niches", error);
    return NextResponse.json(
      { error: "Não foi possível carregar os nichos. O banco já foi criado? Rode: npm run setup" },
      { status: 500 },
    );
  }
}
