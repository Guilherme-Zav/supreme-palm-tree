import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/favorites → alterna (toggle) um agente favorito de um nicho
// body: { nicheId, agentId }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nicheId = String(body?.nicheId ?? "");
    const agentId = String(body?.agentId ?? "");
    if (!nicheId || !agentId) {
      return NextResponse.json(
        { error: "nicheId e agentId são obrigatórios." },
        { status: 400 },
      );
    }

    const existing = await prisma.favorite.findUnique({
      where: { nicheId_agentId: { nicheId, agentId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }

    await prisma.favorite.create({ data: { nicheId, agentId } });
    return NextResponse.json({ favorited: true });
  } catch (error) {
    console.error("POST /api/favorites", error);
    return NextResponse.json({ error: "Falha ao favoritar." }, { status: 500 });
  }
}
