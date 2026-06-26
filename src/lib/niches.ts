import type { NicheData } from "./types";

/**
 * Nichos padrão — FONTE ÚNICA da verdade.
 *
 * São usados como SEED do banco (prisma/seed.ts) e também como FALLBACK quando
 * não há banco disponível (ex.: deploy rápido na Vercel só para testar a
 * geração). Assim os agentes funcionam mesmo sem persistência configurada.
 *
 * O `id` aqui é o próprio slug (estável). Quando o banco está populado, a API
 * usa os ids reais do banco; quando não está, usa estes.
 */
export const DEFAULT_NICHES: NicheData[] = [
  {
    id: "iphones-seminovos",
    slug: "iphones-seminovos",
    name: "Loja de iPhones Semi-Novos",
    emoji: "📱",
    accentColor: "#3b82f6",
    favoriteAgentIds: [],
    dna: {
      businessName: "iStore Prime (loja de iPhones semi-novos)",
      product:
        "Loja online de iPhones semi-novos e acessórios. Aparelhos testados, com bateria saudável e garantia. Entrega para todo o Brasil.",
      idealCustomer:
        "Pessoas que querem status e um celular top da Apple, mas com preço acessível. Sabem que o iPhone novo está caro e não querem pagar preço de lançamento, mas não abrem mão da experiência e do status da marca. Desejos: status, ter um iPhone bom, economizar e a sensação de fazer um ótimo negócio.",
      valueProposition:
        "O iPhone que você quer pela metade do preço do lançamento, com a mesma experiência e status — testado, com garantia e suporte de gente de verdade. A escolha inteligente de quem entende de tecnologia.",
      toneOfVoice: "Direto, confiante, jovem e aspiracional.",
      objections:
        '"E se vier com defeito?"; "Tem garantia?"; "A bateria é boa?"; "É confiável comprar online?"; "Por que está tão barato?".',
      proof:
        "Aparelhos com no mínimo 85% de saúde de bateria, testados em 30+ pontos. Garantia de 90 dias. Milhares de clientes satisfeitos e avaliações 5 estrelas.",
      competitors:
        "Lojas físicas de shopping (caras), marketplaces sem garantia e vendedores informais (arriscados).",
    },
  },
  {
    id: "app-fitness-ia",
    slug: "app-fitness-ia",
    name: "App Fitness com IA",
    emoji: "💪",
    accentColor: "#22c55e",
    favoriteAgentIds: [],
    dna: {
      businessName: "FitMind IA (app de dieta e treino com IA)",
      product:
        "App fitness integrado com IA que monta dieta e treino automaticamente, ajustando conforme seus resultados, rotina e preferências.",
      idealCustomer:
        "Pessoas que querem praticidade, saúde e estética, mas acham nutricionista caro ou inconveniente. Querem emagrecer ou ganhar músculo de forma prática e economizar com profissionais. O app 'substitui' o nutricionista com ótimo custo-benefício. Dores/medos: falta de tempo, nutricionista é caro, não saber o que comer/treinar e dúvida se a IA funciona tão bem quanto um humano.",
      valueProposition:
        "Seu nutricionista e personal no bolso, 24h por dia, por uma fração do preço. A IA monta sua dieta e seu treino em segundos e ajusta tudo conforme você evolui — praticidade, resultado e economia.",
      toneOfVoice: "Motivador, empático e direto.",
      objections:
        '"IA funciona tão bem quanto nutricionista?"; "É seguro?"; "Vou ter resultado de verdade?"; "É difícil de usar?"; "Vale o preço?".',
      proof:
        "Planos baseados em ciência nutricional e de treino. Milhares de usuários relatando resultados nas primeiras semanas. Ajuste automático e suporte.",
      competitors:
        "Nutricionistas particulares (caros), personal trainers (caros) e planilhas/genéricos da internet (sem personalização).",
    },
  },
];

export function getDefaultNiche(id: string): NicheData | undefined {
  return DEFAULT_NICHES.find((n) => n.id === id || n.slug === id);
}
