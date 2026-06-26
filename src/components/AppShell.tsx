"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Agent } from "@/lib/agents";
import type {
  CampaignDNAData,
  FolderData,
  GenerationData,
  NicheData,
} from "@/lib/types";
import AgentGrid from "./AgentGrid";
import GeneratePanel from "./GeneratePanel";
import DnaEditor from "./DnaEditor";
import HistoryView from "./HistoryView";
import { Sparkles, Grid, History, Dna, Chevron, Check, X } from "./icons";

type View = "agentes" | "gerar" | "historico" | "dna";
type Toast = { id: number; message: string; type: "ok" | "error" };

export default function AppShell() {
  const [niches, setNiches] = useState<NicheData[]>([]);
  const [activeNicheId, setActiveNicheId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [view, setView] = useState<View>("agentes");
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const [generations, setGenerations] = useState<GenerationData[]>([]);
  const [folders, setFolders] = useState<FolderData[]>([]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [nicheMenuOpen, setNicheMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeNiche = useMemo(
    () => niches.find((n) => n.id === activeNicheId) ?? null,
    [niches, activeNicheId],
  );

  // ── Toast ──────────────────────────────────────────────────────────
  const notify = useCallback((message: string, type: "ok" | "error" = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id));
    }, 3200);
  }, []);

  // ── Carregar nichos ─────────────────────────────────────────────────
  const loadNiches = useCallback(async () => {
    try {
      const res = await fetch("/api/niches");
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Falha ao carregar nichos.");
      const list: NicheData[] = data.niches ?? [];
      setNiches(list);
      setActiveNicheId((cur) => cur || list[0]?.id || "");
      setLoadError(null);
    } catch (e: any) {
      setLoadError(e?.message || "Falha ao carregar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNiches();
  }, [loadNiches]);

  // ── Carregar histórico + pastas do nicho ativo ──────────────────────
  const loadHistory = useCallback(async (nicheId: string) => {
    if (!nicheId) return;
    try {
      const [gRes, fRes] = await Promise.all([
        fetch(`/api/generations?nicheId=${nicheId}`),
        fetch(`/api/folders?nicheId=${nicheId}`),
      ]);
      const gData = await gRes.json();
      const fData = await fRes.json();
      setGenerations(gData.generations ?? []);
      setFolders(fData.folders ?? []);
    } catch {
      // silencioso — histórico não é crítico para gerar
    }
  }, []);

  useEffect(() => {
    if (activeNicheId) loadHistory(activeNicheId);
  }, [activeNicheId, loadHistory]);

  // ── Aplicar cor de destaque do nicho ────────────────────────────────
  const accentStyle = useMemo(() => {
    const c = activeNiche?.accentColor || "#7c5cff";
    return {
      "--accent": c,
      "--accent-soft": `color-mix(in srgb, ${c} 55%, white)`,
      "--accent-shadow": `color-mix(in srgb, ${c} 45%, transparent)`,
    } as React.CSSProperties;
  }, [activeNiche]);

  // ── Fechar menu de nicho ao clicar fora ─────────────────────────────
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setNicheMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // ── Ações ───────────────────────────────────────────────────────────
  function selectNiche(id: string) {
    setActiveNicheId(id);
    setNicheMenuOpen(false);
    setSelectedAgent(null);
    setView("agentes");
  }

  function selectAgent(agent: Agent) {
    setSelectedAgent(agent);
    setView("gerar");
  }

  async function toggleFavorite(agentId: string) {
    if (!activeNiche) return;
    const isFav = activeNiche.favoriteAgentIds.includes(agentId);
    // Atualização otimista
    setNiches((prev) =>
      prev.map((n) =>
        n.id === activeNiche.id
          ? {
              ...n,
              favoriteAgentIds: isFav
                ? n.favoriteAgentIds.filter((a) => a !== agentId)
                : [...n.favoriteAgentIds, agentId],
            }
          : n,
      ),
    );
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nicheId: activeNiche.id, agentId }),
      });
    } catch {
      notify("Falha ao favoritar.", "error");
      loadNiches();
    }
  }

  async function saveDna(data: CampaignDNAData) {
    if (!activeNiche) return;
    const res = await fetch("/api/dna", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nicheId: activeNiche.id, ...data }),
    });
    if (!res.ok) throw new Error("save failed");
    setNiches((prev) =>
      prev.map((n) => (n.id === activeNiche.id ? { ...n, dna: data } : n)),
    );
  }

  const favoriteIds = activeNiche?.favoriteAgentIds ?? [];

  // ── Render ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="flex items-center gap-3 text-zinc-400">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
          Carregando sua agência...
        </div>
      </div>
    );
  }

  if (loadError || !activeNiche) {
    return (
      <div className="grid min-h-dvh place-items-center px-6">
        <div className="card max-w-md p-6 text-center">
          <h1 className="mb-2 font-display text-lg font-semibold text-white">
            Não foi possível carregar
          </h1>
          <p className="text-sm text-zinc-400">
            {loadError ||
              "Nenhum nicho encontrado. Rode a configuração do banco:"}
          </p>
          <pre className="mt-3 rounded-lg bg-ink-900 px-3 py-2 text-left text-xs text-zinc-300">
            npm run setup
          </pre>
          <button onClick={loadNiches} className="btn-primary mt-4">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={accentStyle} className="min-h-dvh">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          {/* Marca */}
          <div className="flex items-center gap-2.5">
            <div
              className="grid h-9 w-9 place-items-center rounded-xl text-white shadow-accent-glow"
              style={{
                background:
                  "linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 60%, #000))",
              }}
            >
              <Sparkles width={18} height={18} />
            </div>
            <div className="leading-tight">
              <div className="font-display text-[15px] font-bold text-white">
                Minha Agência <span style={{ color: "var(--accent-soft)" }}>IA</span>
              </div>
              <div className="hidden text-[11px] text-zinc-500 sm:block">
                Copy que vende, no automático
              </div>
            </div>
          </div>

          <div className="flex-1" />

          {/* Seletor de nicho */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setNicheMenuOpen((o) => !o)}
              className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.06]"
            >
              <span className="text-base">{activeNiche.emoji}</span>
              <span className="hidden max-w-[160px] truncate sm:inline">
                {activeNiche.name}
              </span>
              <Chevron
                width={16}
                height={16}
                className={`text-zinc-400 transition-transform ${nicheMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {nicheMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-ink-850 shadow-glow animate-fade-up">
                <div className="px-3 py-2 text-[11px] uppercase tracking-wide text-zinc-500">
                  Trocar de negócio
                </div>
                {niches.map((n) => {
                  const active = n.id === activeNicheId;
                  return (
                    <button
                      key={n.id}
                      onClick={() => selectNiche(n.id)}
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-white/[0.05]"
                    >
                      <span
                        className="grid h-8 w-8 place-items-center rounded-lg text-base"
                        style={{ background: `color-mix(in srgb, ${n.accentColor} 18%, transparent)` }}
                      >
                        {n.emoji}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-zinc-200">
                        {n.name}
                      </span>
                      {active && (
                        <Check width={16} height={16} style={{ color: n.accentColor }} />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Navegação */}
        <nav className="mx-auto flex max-w-6xl gap-1 px-2 sm:px-5">
          <NavTab
            active={view === "agentes" || view === "gerar"}
            onClick={() => {
              setView("agentes");
              setSelectedAgent(null);
            }}
            icon={<Grid width={16} height={16} />}
            label="Agentes"
          />
          <NavTab
            active={view === "historico"}
            onClick={() => setView("historico")}
            icon={<History width={16} height={16} />}
            label="Histórico"
            badge={generations.length || undefined}
          />
          <NavTab
            active={view === "dna"}
            onClick={() => setView("dna")}
            icon={<Dna width={16} height={16} />}
            label="DNA da Campanha"
          />
        </nav>
      </header>

      {/* Conteúdo */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {view === "agentes" && (
          <AgentGrid
            favoriteIds={favoriteIds}
            onSelect={selectAgent}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {view === "gerar" && selectedAgent && (
          <GeneratePanel
            niche={activeNiche}
            agent={selectedAgent}
            isFavorite={favoriteIds.includes(selectedAgent.id)}
            onToggleFavorite={() => toggleFavorite(selectedAgent.id)}
            onClose={() => {
              setView("agentes");
              setSelectedAgent(null);
            }}
            onSaved={() => loadHistory(activeNicheId)}
            notify={notify}
          />
        )}

        {view === "historico" && (
          <HistoryView
            niche={activeNiche}
            generations={generations}
            folders={folders}
            onRefresh={() => loadHistory(activeNicheId)}
            notify={notify}
          />
        )}

        {view === "dna" && (
          <DnaEditor niche={activeNiche} onSave={saveDna} notify={notify} />
        )}
      </main>

      {/* Toasts */}
      <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm shadow-glow animate-fade-up ${
              t.type === "error"
                ? "border-red-500/30 bg-red-950/80 text-red-100"
                : "border-white/10 bg-ink-800/90 text-zinc-100"
            } backdrop-blur`}
          >
            {t.type === "error" ? (
              <X width={16} height={16} className="text-red-300" />
            ) : (
              <Check width={16} height={16} style={{ color: "var(--accent-soft)" }} />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function NavTab({
  active,
  onClick,
  icon,
  label,
  badge,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-2 px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
        active ? "text-white" : "text-zinc-400 hover:text-zinc-200"
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {badge ? (
        <span className="rounded-full bg-white/10 px-1.5 text-[11px] text-zinc-300">
          {badge}
        </span>
      ) : null}
      {active && (
        <span
          className="absolute inset-x-2 -bottom-px h-0.5 rounded-full"
          style={{ background: "var(--accent)" }}
        />
      )}
    </button>
  );
}
