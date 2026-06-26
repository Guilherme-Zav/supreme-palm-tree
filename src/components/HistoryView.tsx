"use client";

import { useMemo, useState } from "react";
import type { FolderData, GenerationData, NicheData } from "@/lib/types";
import Markdown from "./Markdown";
import {
  Search,
  Star,
  Trash,
  Folder,
  Edit,
  Copy,
  Check,
  Download,
  Chevron,
  History,
} from "./icons";

export default function HistoryView({
  niche,
  generations,
  folders,
  onRefresh,
  notify,
}: {
  niche: NicheData;
  generations: GenerationData[];
  folders: FolderData[];
  onRefresh: () => void;
  notify: (msg: string, type?: "ok" | "error") => void;
}) {
  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState<string | "todos" | "favoritos">(
    "todos",
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return generations.filter((g) => {
      if (folderFilter === "favoritos" && !g.favorite) return false;
      if (
        folderFilter !== "todos" &&
        folderFilter !== "favoritos" &&
        g.folderId !== folderFilter
      )
        return false;
      if (!q) return true;
      return (
        g.title.toLowerCase().includes(q) ||
        g.result.toLowerCase().includes(q) ||
        g.agentLabel.toLowerCase().includes(q)
      );
    });
  }, [generations, query, folderFilter]);

  async function patch(id: string, data: Record<string, unknown>) {
    setBusy(true);
    try {
      const res = await fetch(`/api/generations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      onRefresh();
    } catch {
      notify("Falha ao atualizar.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Excluir esta geração? Essa ação não pode ser desfeita.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/generations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      notify("Geração excluída.");
      onRefresh();
    } catch {
      notify("Falha ao excluir.", "error");
    } finally {
      setBusy(false);
    }
  }

  async function createFolder() {
    const name = prompt("Nome da pasta/projeto:");
    if (!name?.trim()) return;
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicheId: niche.id, name: name.trim() }),
      });
      if (!res.ok) throw new Error();
      notify("Pasta criada.");
      onRefresh();
    } catch {
      notify("Falha ao criar a pasta.", "error");
    }
  }

  async function deleteFolder(id: string) {
    if (!confirm("Excluir esta pasta? As gerações dentro dela ficam sem pasta."))
      return;
    try {
      const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      if (folderFilter === id) setFolderFilter("todos");
      notify("Pasta excluída.");
      onRefresh();
    } catch {
      notify("Falha ao excluir a pasta.", "error");
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-5 flex items-start gap-4">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
          style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)" }}
        >
          <History />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            Histórico
          </h2>
          <p className="mt-0.5 text-sm text-zinc-400">
            Tudo que você gerou para <b className="text-zinc-200">{niche.name}</b>.
            Organize em pastas, renomeie, favorite e exporte.
          </p>
        </div>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
          <Search />
        </span>
        <input
          className="input pl-10"
          placeholder="Buscar no histórico..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Filtro por pasta */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <FilterChip
          active={folderFilter === "todos"}
          onClick={() => setFolderFilter("todos")}
        >
          Todos ({generations.length})
        </FilterChip>
        <FilterChip
          active={folderFilter === "favoritos"}
          onClick={() => setFolderFilter("favoritos")}
        >
          <Star filled={folderFilter === "favoritos"} width={14} height={14} />
          Favoritos
        </FilterChip>
        {folders.map((f) => (
          <span key={f.id} className="group/folder relative inline-flex">
            <FilterChip
              active={folderFilter === f.id}
              onClick={() => setFolderFilter(f.id)}
            >
              <Folder width={14} height={14} />
              {f.name}
            </FilterChip>
            <button
              onClick={() => deleteFolder(f.id)}
              className="ml-1 hidden text-zinc-500 hover:text-red-300 group-hover/folder:inline"
              title="Excluir pasta"
            >
              <Trash width={14} height={14} />
            </button>
          </span>
        ))}
        <button
          onClick={createFolder}
          className="chip border-dashed text-zinc-400 hover:text-white"
        >
          + Nova pasta
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="card grid place-items-center px-6 py-16 text-center">
          <p className="text-sm text-zinc-400">
            {generations.length === 0
              ? "Nada por aqui ainda. Gere seu primeiro conteúdo na aba Agentes."
              : "Nenhum resultado para esse filtro."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => (
            <HistoryItem
              key={g.id}
              gen={g}
              folders={folders}
              expanded={expandedId === g.id}
              busy={busy}
              onToggle={() =>
                setExpandedId((cur) => (cur === g.id ? null : g.id))
              }
              onPatch={patch}
              onDelete={() => remove(g.id)}
              notify={notify}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
        active
          ? "border-transparent text-white"
          : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]"
      }`}
      style={
        active
          ? { background: "color-mix(in srgb, var(--accent) 24%, transparent)", borderColor: "var(--accent)" }
          : undefined
      }
    >
      {children}
    </button>
  );
}

function HistoryItem({
  gen,
  folders,
  expanded,
  busy,
  onToggle,
  onPatch,
  onDelete,
  notify,
}: {
  gen: GenerationData;
  folders: FolderData[];
  expanded: boolean;
  busy: boolean;
  onToggle: () => void;
  onPatch: (id: string, data: Record<string, unknown>) => void;
  onDelete: () => void;
  notify: (msg: string, type?: "ok" | "error") => void;
}) {
  const [copied, setCopied] = useState(false);
  const date = new Date(gen.createdAt).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  async function copy() {
    try {
      await navigator.clipboard.writeText(gen.result);
      setCopied(true);
      notify("Copiado.");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      notify("Não foi possível copiar.", "error");
    }
  }

  function download() {
    const blob = new Blob([gen.result], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${gen.title.replace(/[^\w\-]+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function rename() {
    const next = prompt("Renomear:", gen.title);
    if (next?.trim() && next.trim() !== gen.title) {
      onPatch(gen.id, { title: next.trim() });
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={onToggle}
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg text-zinc-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
          aria-label={expanded ? "Recolher" : "Expandir"}
        >
          <Chevron width={18} height={18} />
        </button>

        <button onClick={onToggle} className="min-w-0 flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-lg">{gen.agentEmoji}</span>
            <h4 className="truncate font-medium text-white">{gen.title}</h4>
          </div>
          <p className="mt-0.5 truncate text-xs text-zinc-500">
            {gen.agentLabel} · {date}
            {gen.folderId
              ? ` · 📁 ${folders.find((f) => f.id === gen.folderId)?.name ?? ""}`
              : ""}
          </p>
        </button>

        <div className="flex shrink-0 items-center gap-1">
          <button
            onClick={() => onPatch(gen.id, { favorite: !gen.favorite })}
            disabled={busy}
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:text-amber-300"
            style={{ color: gen.favorite ? "#fcd34d" : undefined }}
            title={gen.favorite ? "Desfavoritar" : "Favoritar"}
          >
            <Star filled={gen.favorite} width={16} height={16} />
          </button>
          <button
            onClick={onDelete}
            disabled={busy}
            className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 hover:text-red-300"
            title="Excluir"
          >
            <Trash width={16} height={16} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/[0.06] px-4 pb-4 pt-3">
          {gen.instructions && (
            <p className="mb-3 rounded-lg bg-white/[0.03] px-3 py-2 text-xs text-zinc-400">
              <b className="text-zinc-300">Instruções:</b> {gen.instructions}
            </p>
          )}

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button onClick={copy} className="btn-subtle !py-1.5 !text-xs">
              {copied ? <Check width={14} height={14} /> : <Copy width={14} height={14} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
            <button onClick={download} className="btn-subtle !py-1.5 !text-xs">
              <Download width={14} height={14} /> Exportar .md
            </button>
            <button onClick={rename} className="btn-subtle !py-1.5 !text-xs">
              <Edit width={14} height={14} /> Renomear
            </button>
            <select
              value={gen.folderId ?? ""}
              onChange={(e) =>
                onPatch(gen.id, { folderId: e.target.value || null })
              }
              className="input !w-auto !py-1.5 !text-xs"
              title="Mover para pasta"
            >
              <option value="">📁 Sem pasta</option>
              {folders.map((f) => (
                <option key={f.id} value={f.id}>
                  📁 {f.name}
                </option>
              ))}
            </select>
          </div>

          <div className="max-h-[460px] overflow-y-auto rounded-xl border border-white/[0.06] bg-ink-900/50 p-4">
            <Markdown content={gen.result} />
          </div>
        </div>
      )}
    </div>
  );
}
