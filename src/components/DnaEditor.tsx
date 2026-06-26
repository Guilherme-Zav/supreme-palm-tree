"use client";

import { useEffect, useState } from "react";
import type { CampaignDNAData, NicheData } from "@/lib/types";
import { Dna } from "./icons";

const FIELDS: {
  key: keyof CampaignDNAData;
  label: string;
  placeholder: string;
  big?: boolean;
}[] = [
  {
    key: "businessName",
    label: "Nome do negócio",
    placeholder: "Ex.: iStore Prime",
  },
  {
    key: "product",
    label: "Produto / serviço (descrição)",
    placeholder: "O que você vende, em poucas linhas...",
    big: true,
  },
  {
    key: "idealCustomer",
    label: "Cliente ideal (ICP) — quem é, dores, desejos",
    placeholder: "Quem é seu cliente perfeito? O que ele teme e o que deseja?",
    big: true,
  },
  {
    key: "valueProposition",
    label: "Proposta de valor / diferencial",
    placeholder: "Por que comprar de você e não do concorrente?",
    big: true,
  },
  {
    key: "toneOfVoice",
    label: "Tom de voz",
    placeholder: "Ex.: direto, jovem, autoridade, descontraído...",
  },
  {
    key: "objections",
    label: "Objeções comuns dos clientes",
    placeholder: '"É caro", "será que funciona?", "tem garantia?"...',
    big: true,
  },
  {
    key: "proof",
    label: "Provas / resultados / cases (opcional)",
    placeholder: "Depoimentos, números, garantias, autoridade...",
    big: true,
  },
  {
    key: "competitors",
    label: "Concorrentes (opcional)",
    placeholder: "Quem são os concorrentes e como você se diferencia?",
  },
];

export default function DnaEditor({
  niche,
  onSave,
  notify,
}: {
  niche: NicheData;
  onSave: (data: CampaignDNAData) => Promise<void>;
  notify: (msg: string, type?: "ok" | "error") => void;
}) {
  const [form, setForm] = useState<CampaignDNAData>(niche.dna);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setForm(niche.dna);
    setDirty(false);
  }, [niche.id, niche.dna]);

  function update(key: keyof CampaignDNAData, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(form);
      setDirty(false);
      notify("DNA da Campanha salvo.");
    } catch {
      notify("Não foi possível salvar o DNA.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-5 flex items-start gap-4">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl"
          style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)" }}
        >
          <Dna />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            DNA da Campanha
          </h2>
          <p className="mt-0.5 max-w-2xl text-sm text-zinc-400">
            Esse é o contexto de <b className="text-zinc-200">{niche.name}</b>. Ele é
            injetado automaticamente em <b className="text-zinc-200">todos os
            agentes</b> deste nicho — quanto mais completo, melhor a copy.
          </p>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="grid gap-5 md:grid-cols-2">
          {FIELDS.map((f) => (
            <div key={f.key} className={f.big ? "md:col-span-2" : ""}>
              <label className="label" htmlFor={`dna-${f.key}`}>
                {f.label}
              </label>
              {f.big ? (
                <textarea
                  id={`dna-${f.key}`}
                  className="input min-h-[96px] resize-y"
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              ) : (
                <input
                  id={`dna-${f.key}`}
                  className="input"
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={(e) => update(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          {dirty && (
            <span className="text-xs text-amber-300/80">
              Alterações não salvas
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className="btn-primary"
          >
            {saving ? "Salvando..." : "Salvar DNA"}
          </button>
        </div>
      </div>
    </div>
  );
}
