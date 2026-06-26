import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAgent } from "@/lib/agents";
import type { GenerationData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serialize(g: any): GenerationData {
  return {
    id: g.id,
    nicheId: g.nicheId,
    agentId: g.agentId,
    agentLabel: g.agentLabel,
    agentEmoji: g.agentEmoji,
    category: g.category,
    title: g.title,
    instructions: g.instructions,
    result: g.result,
    favorite: g.favorite,
    folderId: g.folderId,
    createdAt: g.createdAt.toISOString(),
  };
}

// GET /api/generations?nicheId=... → histórico do nicho (mais recentes primeiro)
export async function GET(req: NextRequest) {
  try {
    const nicheId = req.nextUrl.searchParams.get("nicheId") ?? undefined;
    const items = await prisma.generation.findMany({
      where: nicheId ? { nicheId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ generations: items.map(serialize) });
  } catch (error) {
    console.error("GET /api/generations", error);
    return NextResponse.json({ error: "Falha ao carregar o histórico." }, { status: 500 });
  }
}

// POST /api/generations → salva uma geração no histórico
// body: { nicheId, agentId, instructions, result, title?, folderId? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nicheId = String(body?.nicheId ?? "");
    const agentId = String(body?.agentId ?? "");
    const result = String(body?.result ?? "");

    if (!nicheId || !agentId || !result.trim()) {
      return NextResponse.json(
        { error: "nicheId, agentId e result são obrigatórios." },
        { status: 400 },
      );
    }

    const agent = getAgent(agentId);
    const created = await prisma.generation.create({
      data: {
        nicheId,
        agentId,
        agentLabel: agent?.label ?? agentId,
        agentEmoji: agent?.emoji ?? "✨",
        category: agent?.category ?? "",
        title: String(body?.title ?? agent?.label ?? agentId),
        instructions: String(body?.instructions ?? ""),
        result,
        folderId: body?.folderId ? String(body.folderId) : null,
      },
    });

    return NextResponse.json({ generation: serialize(created) });
  } catch (error) {
    console.error("POST /api/generations", error);
    return NextResponse.json({ error: "Falha ao salvar a geração." }, { status: 500 });
  }
}
