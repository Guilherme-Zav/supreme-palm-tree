import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EMPTY_DNA, type NicheData } from "@/lib/types";
import { DEFAULT_NICHES } from "@/lib/niches";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/niches → lista os nichos com DNA e agentes favoritos.
// Se o banco estiver vazio ou indisponível (ex.: deploy sem banco persistente),
// devolve os nichos padrão em código — assim os agentes funcionam mesmo assim.
export async function GET() {
  try {
    const niches = await prisma.niche.findMany({
      orderBy: { createdAt: "asc" },
      include: { dna: true, favorites: true },
    });

    if (niches.length === 0) {
      return NextResponse.json({ niches: DEFAULT_NICHES, persistent: true });
    }

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

    return NextResponse.json({ niches: data, persistent: true });
  } catch (error) {
    // Banco indisponível → usa os nichos padrão (modo "só geração").
    console.warn("GET /api/niches: banco indisponível, usando nichos padrão.");
    return NextResponse.json({ niches: DEFAULT_NICHES, persistent: false });
  }
}
