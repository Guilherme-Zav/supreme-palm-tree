import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PATCH /api/folders/[id] → renomear pasta. body: { name }
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }
    const folder = await prisma.folder.update({
      where: { id: params.id },
      data: { name },
    });
    return NextResponse.json({ ok: true, folder: { ...folder, createdAt: folder.createdAt.toISOString() } });
  } catch (error) {
    console.error("PATCH /api/folders/[id]", error);
    return NextResponse.json({ error: "Falha ao renomear a pasta." }, { status: 500 });
  }
}

// DELETE /api/folders/[id] → exclui a pasta (gerações ficam "sem pasta")
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.folder.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/folders/[id]", error);
    return NextResponse.json({ error: "Falha ao excluir a pasta." }, { status: 500 });
  }
}
