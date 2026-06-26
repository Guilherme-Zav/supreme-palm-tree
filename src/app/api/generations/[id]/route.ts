import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// PATCH /api/generations/[id] → renomear, mover de pasta, favoritar
// body: { title?, folderId?, favorite? }
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body?.title === "string") data.title = body.title;
    if (typeof body?.favorite === "boolean") data.favorite = body.favorite;
    if ("folderId" in (body ?? {})) {
      data.folderId = body.folderId ? String(body.folderId) : null;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
    }

    const updated = await prisma.generation.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ ok: true, generation: { ...updated, createdAt: updated.createdAt.toISOString() } });
  } catch (error) {
    console.error("PATCH /api/generations/[id]", error);
    return NextResponse.json({ error: "Falha ao atualizar a geração." }, { status: 500 });
  }
}

// DELETE /api/generations/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.generation.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/generations/[id]", error);
    return NextResponse.json({ error: "Falha ao excluir a geração." }, { status: 500 });
  }
}
