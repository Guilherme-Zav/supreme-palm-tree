"use client";

import { useMemo, useState } from "react";
import { AGENTS, CATEGORIES, type Agent, type CategoryId } from "@/lib/agents";
import { Search, Star } from "./icons";

export default function AgentGrid({
  favoriteIds,
  onSelect,
  onToggleFavorite,
}: {
  favoriteIds: string[];
  onSelect: (agent: Agent) => void;
  onToggleFavorite: (agentId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<CategoryId | "todos" | "favoritos">(
    "todos",
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return AGENTS.filter((a) => {
      if (activeCat === "favoritos" && !favoriteIds.includes(a.id)) return false;
      if (activeCat !== "todos" && activeCat !== "favoritos" && a.category !== activeCat)
        return false;
      if (!q) return true;
      return (
        a.label.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
      );
    });
  }, [query, activeCat, favoriteIds]);

  // Agrupa por categoria preservando a ordem das categorias.
  const groups = useMemo(() => {
    return CATEGORIES.map((cat) => ({
      cat,
      items: filtered.filter((a) => a.category === cat.id),
    })).filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <div className="animate-fade-up">
      {/* Busca + filtros */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
            <Search />
          </span>
          <input
            className="input pl-10"
            placeholder="Buscar agente..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <Tab active={activeCat === "todos"} onClick={() => setActiveCat("todos")}>
          Todos
        </Tab>
        <Tab
          active={activeCat === "favoritos"}
          onClick={() => setActiveCat("favoritos")}
        >
          <Star filled={activeCat === "favoritos"} width={14} height={14} />
          Favoritos
        </Tab>
        {CATEGORIES.map((c) => (
          <Tab
            key={c.id}
            active={activeCat === c.id}
            onClick={() => setActiveCat(c.id)}
          >
            <span>{c.emoji}</span>
            {c.label}
          </Tab>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="card grid place-items-center px-6 py-16 text-center">
          <p className="text-sm text-zinc-400">
            {activeCat === "favoritos"
              ? "Você ainda não favoritou nenhum agente. Toque na ⭐ de um agente para tê-lo aqui."
              : "Nenhum agente encontrado para essa busca."}
          </p>
        </div>
      )}

      <div className="space-y-8">
        {groups.map(({ cat, items }) => (
          <section key={cat.id}>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              <span>{cat.emoji}</span> {cat.label}
              <span className="text-xs font-normal text-zinc-600">
                {items.length}
              </span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {items.map((agent) => (
                <AgentCard
                  key={agent.id}
                  agent={agent}
                  favorite={favoriteIds.includes(agent.id)}
                  onSelect={() => onSelect(agent)}
                  onToggleFavorite={() => onToggleFavorite(agent.id)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Tab({
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
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all ${
        active
          ? "border-transparent text-white"
          : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05] hover:text-zinc-200"
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

function AgentCard({
  agent,
  favorite,
  onSelect,
  onToggleFavorite,
}: {
  agent: Agent;
  favorite: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="group card relative cursor-pointer p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-glow"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite();
        }}
        className="absolute right-3 top-3 text-zinc-600 transition-colors hover:text-amber-300"
        style={{ color: favorite ? "#fcd34d" : undefined }}
        aria-label={favorite ? "Desfavoritar" : "Favoritar"}
        title={favorite ? "Desfavoritar" : "Favoritar"}
      >
        <Star filled={favorite} width={18} height={18} />
      </button>

      <div
        className="mb-3 grid h-11 w-11 place-items-center rounded-xl text-xl transition-transform group-hover:scale-105"
        style={{ background: "color-mix(in srgb, var(--accent) 15%, transparent)" }}
      >
        {agent.emoji}
      </div>
      <h4 className="pr-6 font-display text-[15px] font-semibold text-white">
        {agent.label}
      </h4>
      <p className="mt-1 text-[13px] leading-snug text-zinc-400">
        {agent.description}
      </p>
    </div>
  );
}
