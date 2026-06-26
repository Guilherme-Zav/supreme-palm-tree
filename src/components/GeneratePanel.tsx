"use client";

import { useEffect, useRef, useState } from "react";
import type { Agent } from "@/lib/agents";
import type { NicheData } from "@/lib/types";
import Markdown from "./Markdown";
import {
  Sparkles,
  Copy,
  Check,
  Download,
  Refresh,
  X,
  Star,
} from "./icons";

const ERROR_SENTINEL = "__ERRO__:";

export default function GeneratePanel({
  niche,
  agent,
  isFavorite,
  onToggleFavorite,
  onClose,
  onSaved,
  notify,
}: {
  niche: NicheData;
  agent: Agent;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
  onSaved: () => void;
  notify: (msg: string, type?: "ok" | "error") => void;
}) {
  const [instructions, setInstructions] = useState("");
  const [model, setModel] = useState<"quality" | "fast">("quality");
  const [output, setOutput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Lê preferência de modelo salva localmente.
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("model-pref") : null;
    if (saved === "fast" || saved === "quality") setModel(saved);
  }, []);

  // Reseta ao trocar de agente.
  useEffect(() => {
    setInstructions("");
    setOutput("");
    setError(null);
    setIsGenerating(false);
    abortRef.current?.abort();
  }, [agent.id]);

  // Auto-scroll suave durante o streaming.
  useEffect(() => {
    if (isGenerating && outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output, isGenerating]);

  function pickModel(m: "quality" | "fast") {
    setModel(m);
    if (typeof window !== "undefined") localStorage.setItem("model-pref", m);
  }

  async function generate() {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);
    setOutput("");
    setIsDemo(false);

    const controller = new AbortController();
    abortRef.current = controller;

    let accumulated = "";
    let failed = false;

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheId: niche.id,
          agentId: agent.id,
          instructions,
          model,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Falha ao iniciar a geração.");
      }

      setIsDemo(res.headers.get("X-Demo") === "1");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        // Erro sinalizado dentro do stream.
        const idx = accumulated.indexOf(ERROR_SENTINEL);
        if (idx !== -1) {
          const before = accumulated.slice(0, idx).trim();
          const msg = accumulated.slice(idx + ERROR_SENTINEL.length).trim();
          setOutput(before);
          setError(msg || "Erro ao gerar o conteúdo.");
          failed = true;
          break;
        }

        setOutput(accumulated);
      }

      if (!failed) {
        const finalText = accumulated.trim();
        setOutput(finalText);
        if (finalText) {
          await saveToHistory(finalText);
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // cancelado pelo usuário — mantém o que já apareceu
      } else {
        setError(err?.message || "Erro inesperado ao gerar.");
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }

  async function saveToHistory(text: string) {
    try {
      const res = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nicheId: niche.id,
          agentId: agent.id,
          instructions,
          result: text,
        }),
      });
      if (res.ok) {
        onSaved();
      }
    } catch {
      // salvar no histórico é "best effort" — não bloqueia o usuário
    }
  }

  function stop() {
    abortRef.current?.abort();
    setIsGenerating(false);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      notify("Copiado para a área de transferência.");
      setTimeout(() => setCopied(false), 1600);
    } catch {
      notify("Não foi possível copiar.", "error");
    }
  }

  function download(ext: "txt" | "md") {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const safe = `${agent.label}-${niche.slug}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    a.href = url;
    a.download = `${safe}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const hasOutput = output.trim().length > 0;

  return (
    <div className="animate-fade-up">
      {/* Cabeçalho do agente */}
      <div className="mb-5 flex items-start gap-4">
        <button
          onClick={onClose}
          className="btn-ghost mt-0.5 !px-2.5 !py-2"
          aria-label="Voltar para os agentes"
        >
          <X width={16} height={16} />
        </button>

        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl"
          style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)" }}
        >
          {agent.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-display text-xl font-semibold text-white">
              {agent.label}
            </h2>
            <button
              onClick={onToggleFavorite}
              className="text-zinc-500 transition-colors hover:text-amber-300"
              style={{ color: isFavorite ? "#fcd34d" : undefined }}
              aria-label={isFavorite ? "Desfavoritar agente" : "Favoritar agente"}
              title={isFavorite ? "Desfavoritar" : "Favoritar"}
            >
              <Star filled={isFavorite} width={18} height={18} />
            </button>
          </div>
          <p className="mt-0.5 text-sm text-zinc-400">{agent.description}</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,360px)_1fr]">
        {/* Coluna de controles */}
        <div className="card space-y-4 self-start p-5">
          <div>
            <label className="label" htmlFor="instructions">
              Instruções extras (opcional)
            </label>
            <textarea
              id="instructions"
              className="input min-h-[120px] resize-y"
              placeholder="Ex.: foque na Black Friday, mencione frete grátis, tom mais ousado..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-zinc-500">
              O DNA da Campanha de <b className="text-zinc-300">{niche.name}</b> já
              é injetado automaticamente.
            </p>
          </div>

          <div>
            <span className="label">Qualidade do modelo</span>
            <div className="grid grid-cols-2 gap-2">
              <ModelOption
                active={model === "quality"}
                onClick={() => pickModel("quality")}
                title="Máxima"
                subtitle="Melhor copy"
              />
              <ModelOption
                active={model === "fast"}
                onClick={() => pickModel("fast")}
                title="Rápida"
                subtitle="Mais ágil"
              />
            </div>
          </div>

          {!isGenerating ? (
            <button
              onClick={generate}
              className="btn-primary w-full !py-3 text-[15px]"
            >
              <Sparkles width={18} height={18} />
              {hasOutput ? "Gerar novamente" : "Gerar conteúdo"}
            </button>
          ) : (
            <button onClick={stop} className="btn-ghost w-full !py-3">
              Parar geração
            </button>
          )}
        </div>

        {/* Coluna de resultado */}
        <div className="card flex min-h-[320px] flex-col p-0">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              Resultado
            </span>
            {hasOutput && (
              <div className="flex items-center gap-1.5">
                <IconBtn onClick={copy} title="Copiar">
                  {copied ? <Check width={16} height={16} /> : <Copy width={16} height={16} />}
                </IconBtn>
                <IconBtn onClick={() => download("md")} title="Baixar .md">
                  <Download width={16} height={16} />
                </IconBtn>
                {!isGenerating && (
                  <IconBtn onClick={generate} title="Regenerar">
                    <Refresh width={16} height={16} />
                  </IconBtn>
                )}
              </div>
            )}
          </div>

          <div ref={outputRef} className="min-h-0 flex-1 overflow-y-auto p-5">
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {!hasOutput && !isGenerating && !error && <EmptyState />}

            {isGenerating && !hasOutput && <Loading />}

            {isDemo && hasOutput && (
              <div className="mb-4 rounded-xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
                🧪 <b>Modo demonstração</b> — texto de exemplo, sem custo. Para
                copy real de alta conversão, configure a chave da Anthropic
                (<code>ANTHROPIC_API_KEY</code>).
              </div>
            )}

            {hasOutput && (
              <Markdown content={output} typing={isGenerating} />
            )}
          </div>

          {hasOutput && (
            <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.06] px-5 py-3">
              <button onClick={copy} className="btn-subtle !py-2 !text-xs">
                {copied ? <Check width={15} height={15} /> : <Copy width={15} height={15} />}
                {copied ? "Copiado" : "Copiar texto"}
              </button>
              <button onClick={() => download("txt")} className="btn-subtle !py-2 !text-xs">
                <Download width={15} height={15} /> .txt
              </button>
              <button onClick={() => download("md")} className="btn-subtle !py-2 !text-xs">
                <Download width={15} height={15} /> .md
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ModelOption({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
        active
          ? "border-transparent text-white"
          : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]"
      }`}
      style={
        active
          ? { background: "color-mix(in srgb, var(--accent) 22%, transparent)", borderColor: "var(--accent)" }
          : undefined
      }
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs opacity-70">{subtitle}</div>
    </button>
  );
}

function IconBtn({
  children,
  onClick,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="grid h-8 w-8 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-white/[0.07] hover:text-white"
    >
      {children}
    </button>
  );
}

function EmptyState() {
  return (
    <div className="grid h-full place-items-center py-10 text-center">
      <div>
        <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-white/[0.04] text-zinc-400">
          <Sparkles />
        </div>
        <p className="text-sm text-zinc-400">
          Ajuste as instruções (se quiser) e clique em{" "}
          <b className="text-zinc-200">Gerar conteúdo</b>.
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          O texto aparece aqui em tempo real.
        </p>
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="flex items-center gap-3 text-sm text-zinc-400">
      <span className="flex gap-1">
        <Dot /> <Dot delay="0.15s" /> <Dot delay="0.3s" />
      </span>
      Escrevendo sua copy...
    </div>
  );
}

function Dot({ delay = "0s" }: { delay?: string }) {
  return (
    <span
      className="h-2 w-2 rounded-full bg-current animate-pulse-soft"
      style={{ animationDelay: delay, color: "var(--accent-soft)" }}
    />
  );
}
