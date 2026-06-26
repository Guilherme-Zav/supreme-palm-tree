import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { FolderData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function serialize(f: any): FolderData {
  return {
    id: f.id,
    nicheId: f.nicheId,
    name: f.name,
    createdAt: f.createdAt.toISOString(),
  };
}

// GET /api/folders?nicheId=... → pastas/projetos do nicho
export async function GET(req: NextRequest) {
  try {
    const nicheId = req.nextUrl.searchParams.get("nicheId") ?? undefined;
    const folders = await prisma.folder.findMany({
      where: nicheId ? { nicheId } : undefined,
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ folders: folders.map(serialize) });
  } catch (error) {
    console.error("GET /api/folders", error);
    return NextResponse.json({ error: "Falha ao carregar as pastas." }, { status: 500 });
  }
}

// POST /api/folders → cria uma pasta/projeto
// body: { nicheId, name }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nicheId = String(body?.nicheId ?? "");
    const name = String(body?.name ?? "").trim();
    if (!nicheId || !name) {
      return NextResponse.json(
        { error: "nicheId e name são obrigatórios." },
        { status: 400 },
      );
    }
    const folder = await prisma.folder.create({ data: { nicheId, name } });
    return NextResponse.json({ folder: serialize(folder) });
  } catch (error) {
    console.error("POST /api/folders", error);
    return NextResponse.json({ error: "Falha ao criar a pasta." }, { status: 500 });
  }
}
