import type { CampaignDNAData } from "./types";

/**
 * Biblioteca de Agentes.
 *
 * ➕ Para adicionar um agente novo, basta acrescentar um objeto neste array.
 *    Nada mais precisa mudar — a UI, a geração e o histórico se adaptam.
 *
 * Cada agente define:
 *   - id        identificador único e estável (não mude depois de usar)
 *   - category  uma das CATEGORIES abaixo
 *   - emoji     ícone
 *   - label     nome curto exibido
 *   - description  descrição de uma linha
 *   - maxTokens  tamanho máximo da resposta (alguns precisam de mais, ex: VSL)
 *   - task      a instrução específica do que gerar (o "papel" e o DNA são
 *               injetados automaticamente — você só descreve o entregável)
 */

export const CATEGORIES = [
  { id: "conteudo", label: "Conteúdo", emoji: "✍️" },
  { id: "anuncios", label: "Anúncios", emoji: "📣" },
  { id: "vendas", label: "Vendas", emoji: "💰" },
  { id: "relacionamento", label: "Relacionamento", emoji: "💬" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export interface Agent {
  id: string;
  category: CategoryId;
  emoji: string;
  label: string;
  description: string;
  maxTokens: number;
  task: string;
}

export const AGENTS: Agent[] = [
  // ───────────────────────────── CONTEÚDO ─────────────────────────────
  {
    id: "hooks",
    category: "conteudo",
    emoji: "🪝",
    label: "Gerador de Hooks",
    description: "5 hooks que param o scroll e prendem a atenção na hora.",
    maxTokens: 1500,
    task: `Crie 5 hooks (ganchos de abertura) que param o scroll para este negócio.
Cada hook deve ser curto, magnético e gerar curiosidade, choque, identificação ou desejo — pronto para abrir um Reels, anúncio ou post.
Varie os ângulos: dor, desejo, contra-intuitivo, prova/número e pergunta provocativa.
Formato: lista numerada de 1 a 5. Para cada hook, uma linha curta indicando o ângulo usado entre parênteses.`,
  },
  {
    id: "post-instagram",
    category: "conteudo",
    emoji: "📸",
    label: "Post Nativo para Instagram",
    description: "Conteúdo que parece orgânico, mas vende.",
    maxTokens: 1800,
    task: `Escreva um post nativo para o feed do Instagram que pareça conteúdo orgânico de valor, mas que conduza sutilmente à venda.
Entregue:
1. Uma legenda completa (hook forte na 1ª linha, desenvolvimento com valor real, e um CTA natural no final).
2. 3 sugestões de primeira linha alternativas (para teste).
3. Uma lista de 8 a 12 hashtags relevantes.
Tom natural, sem parecer anúncio. Use quebras de linha e emojis com moderação para leitura fluida.`,
  },
  {
    id: "reels-roteiro",
    category: "conteudo",
    emoji: "🎬",
    label: "Roteiro de Reels/Stories",
    description: "Roteiro curto e dinâmico para vídeo vertical.",
    maxTokens: 1800,
    task: `Escreva um roteiro de Reels/Stories de 20 a 40 segundos, curto e dinâmico.
Estruture em blocos com indicação de tempo e ação na tela:
- Gancho (0–3s): o que fala + o que aparece na tela
- Desenvolvimento: falas curtas, ritmo rápido, com cortes
- Virada / prova
- CTA final
Inclua também: sugestão de texto na tela (legendas), sugestão de áudio/trend e a primeira frase exata para falar.`,
  },
  {
    id: "calendario",
    category: "conteudo",
    emoji: "🗓️",
    label: "Calendário de Conteúdo",
    description: "7 dias de ideias de post, cada uma com objetivo.",
    maxTokens: 2600,
    task: `Monte um calendário de conteúdo de 7 dias (segunda a domingo).
Para cada dia entregue:
- Dia e formato sugerido (Reels, carrossel, story, post estático)
- Tema/ideia do post
- Objetivo (atração, autoridade, conexão, prova ou venda) — varie ao longo da semana
- Um gancho/título pronto para usar
Equilibre conteúdo de valor e conteúdo de venda. Use uma tabela ou lista organizada por dia.`,
  },
  {
    id: "bio",
    category: "conteudo",
    emoji: "🪪",
    label: "Gerador de Bio",
    description: "Bio de perfil otimizada: quem é, prova, oferta e CTA.",
    maxTokens: 1200,
    task: `Crie 3 opções de bio de perfil (Instagram/TikTok) otimizadas para conversão.
Cada bio deve, em poucas linhas, comunicar: quem você ajuda, a transformação/prova, a oferta e um CTA claro (com indicação de "link na bio").
Use quebras de linha curtas e, quando fizer sentido, emojis como marcadores. Mantenha dentro de ~150 caracteres por bio.`,
  },

  // ───────────────────────────── ANÚNCIOS ─────────────────────────────
  {
    id: "meta-ads",
    category: "anuncios",
    emoji: "🎯",
    label: "Anúncio Meta Ads",
    description: "Copy completa: hook + corpo + CTA + ideia de criativo.",
    maxTokens: 2000,
    task: `Escreva uma copy completa de anúncio para Meta Ads (Facebook/Instagram).
Entregue:
1. 3 opções de headline/primeira linha (hook).
2. Corpo do anúncio (desenvolvimento persuasivo com dor, desejo, prova e quebra de objeção).
3. CTA forte.
4. Texto do botão sugerido.
5. Sugestão de criativo (descreva a imagem/vídeo ideal e o conceito visual).
Tom de resposta direta, focado em clique e conversão.`,
  },
  {
    id: "variacoes-anuncio",
    category: "anuncios",
    emoji: "🔀",
    label: "Variações de Anúncio",
    description: "3 ângulos diferentes: dor, desejo e prova.",
    maxTokens: 2000,
    task: `Crie 3 variações completas de anúncio para o mesmo produto, cada uma explorando um ângulo psicológico diferente:
- Variação 1 — ângulo da DOR (foca no problema/medo do cliente)
- Variação 2 — ângulo do DESEJO (foca na transformação/status desejado)
- Variação 3 — ângulo da PROVA (foca em resultados, autoridade e quebra de desconfiança)
Cada variação deve ter: hook, corpo e CTA. Deixe claro o título de cada ângulo.`,
  },
  {
    id: "headlines",
    category: "anuncios",
    emoji: "💡",
    label: "Headlines / Big Idea",
    description: "Grandes ideias e títulos magnéticos.",
    maxTokens: 1600,
    task: `Gere material de "big idea" e headlines magnéticas para este negócio.
Entregue:
1. 2 a 3 "big ideas" (o conceito central/ângulo que torna a oferta irresistível), com uma frase explicando cada uma.
2. 10 headlines curtas e magnéticas, prontas para usar em anúncios, páginas ou e-mails.
Misture curiosidade, benefício direto, urgência e prova.`,
  },
  {
    id: "trafego-pago",
    category: "anuncios",
    emoji: "🧭",
    label: "Estrutura de Tráfego Pago",
    description: "Plano de campanha: públicos, estrutura, orçamento e métricas.",
    maxTokens: 2600,
    task: `Monte um PLANO de campanha de tráfego pago (não a copy do anúncio) para este negócio.
Entregue:
1. Objetivo de campanha recomendado e por quê.
2. Públicos/segmentações sugeridos (interesses, lookalikes, retargeting) — concretos para este nicho.
3. Estrutura de campanha (campanhas, conjuntos e anúncios — como organizar).
4. Orçamento inicial sugerido e como distribuir.
5. O que testar primeiro (criativos, públicos, ofertas).
6. Métricas a acompanhar e bons parâmetros de referência (CTR, CPM, CPL/CPA, ROAS).
Seja prático e direto, como um gestor de tráfego experiente.`,
  },

  // ───────────────────────────── VENDAS ─────────────────────────────
  {
    id: "funil",
    category: "vendas",
    emoji: "🌀",
    label: "Funil de Vendas Completo",
    description: "Topo, meio, fundo e pós-venda — específico e prático.",
    maxTokens: 3000,
    task: `Desenhe um funil de vendas completo, específico e prático para este negócio.
Estruture em 4 etapas:
1. TOPO (atração): como atrair desconhecidos — canais, tipos de conteúdo e iscas.
2. MEIO (relacionamento/nutrição): como nutrir e construir desejo/confiança.
3. FUNDO (conversão): a oferta e os mecanismos de conversão (página, prova, gatilhos).
4. PÓS-VENDA: como gerar recompra, indicação e LTV.
Para cada etapa, dê exemplos concretos de ações e mensagens. Termine com os 3 primeiros passos para implementar.`,
  },
  {
    id: "pagina-vendas",
    category: "vendas",
    emoji: "📄",
    label: "Página de Vendas (Copy)",
    description: "Estrutura completa de copy de landing page.",
    maxTokens: 4500,
    task: `Escreva a copy completa de uma página de vendas (landing page) de alta conversão.
Inclua, na ordem, todas as seções com o texto pronto:
1. Headline principal + sub-headline
2. Abertura (identificação com a dor/desejo)
3. Apresentação do problema e por que as soluções comuns falham
4. Apresentação da solução/oferta
5. Benefícios (em bullets que vendem o resultado, não a característica)
6. Prova social / autoridade
7. Detalhamento da oferta + bônus
8. Quebra das principais objeções
9. Garantia
10. Escassez/urgência (se aplicável e honesta)
11. CTA repetido em pontos estratégicos
12. FAQ curto
Use títulos de seção em markdown. Copy persuasiva e específica para este negócio.`,
  },
  {
    id: "objecoes",
    category: "vendas",
    emoji: "🛡️",
    label: "Quebra de Objeções",
    description: "As 5 principais objeções e respostas persuasivas.",
    maxTokens: 2200,
    task: `Liste as 5 principais objeções deste cliente e escreva uma resposta persuasiva para cada uma.
Use prioritariamente as objeções do DNA da Campanha (e complete se faltar).
Para cada objeção:
- A objeção (como o cliente realmente pensa/fala)
- A resposta persuasiva (reframe + prova + reforço do benefício)
- Uma frase curta pronta para usar em anúncio, DM ou página.`,
  },
  {
    id: "email-sequencia",
    category: "vendas",
    emoji: "✉️",
    label: "Sequência de E-mail",
    description: "3 e-mails: boas-vindas, prova social e fechamento.",
    maxTokens: 2800,
    task: `Escreva uma sequência de 3 e-mails de vendas. Para cada e-mail entregue: assunto (2 opções), pré-cabeçalho e corpo completo.
- E-mail 1 — Boas-vindas/conexão: apresente a marca, gere identificação e entregue um primeiro valor.
- E-mail 2 — Prova social/autoridade: use resultados, cases e quebra de desconfiança.
- E-mail 3 — Fechamento: oferta clara, urgência honesta e CTA forte.
Tom humano e persuasivo, com CTAs claros.`,
  },
  {
    id: "vsl",
    category: "vendas",
    emoji: "🎥",
    label: "Roteiro de VSL",
    description: "Roteiro completo de vídeo de vendas longo.",
    maxTokens: 5000,
    task: `Escreva um roteiro completo de VSL (Video Sales Letter) longo, pronto para gravar.
Siga esta estrutura, com o texto falado de cada bloco:
1. Abertura/Gancho (promessa + curiosidade nos primeiros segundos)
2. História/identificação
3. O problema (e por que ele persiste)
4. A virada (descoberta/mecanismo único)
5. A solução (o produto e como funciona)
6. A oferta (o que inclui, bônus, ancoragem de preço)
7. Quebra de objeções
8. Garantia
9. Escassez/urgência
10. CTA final (claro e repetido)
Escreva em primeira pessoa, com linguagem falada e ritmo de vídeo. Use marcações de seção em markdown.`,
  },
  {
    id: "oferta",
    category: "vendas",
    emoji: "🎁",
    label: "Gerador de Oferta",
    description: "Oferta irresistível: ancoragem, bônus, garantia e escassez.",
    maxTokens: 2600,
    task: `Monte uma oferta irresistível para este negócio.
Entregue:
1. A oferta principal (o que é, em uma frase magnética).
2. Empilhamento de valor / ancoragem de preço (mostre o valor percebido x o preço).
3. 2 a 3 bônus estratégicos (com nome e a dor que cada um resolve).
4. Garantia (que remove o risco).
5. Escassez/urgência honesta.
6. Justificativa de valor (por que vale muito mais do que custa).
7. A oferta final montada em formato de "pitch" pronto para usar.`,
  },

  // ─────────────────────────── RELACIONAMENTO ───────────────────────────
  {
    id: "dm-whatsapp",
    category: "relacionamento",
    emoji: "💬",
    label: "Respostas de DM/WhatsApp",
    description: "Templates para responder o lead e conduzir à venda.",
    maxTokens: 2200,
    task: `Crie um kit de respostas para DM/WhatsApp que conduzem o lead à venda.
Entregue templates prontos para os cenários:
1. Primeiro contato / "tem interesse?"
2. Pergunta de preço ("quanto custa?")
3. Objeção/hesitação ("vou pensar", "tá caro")
4. Quebra de desconfiança (golpe/garantia/qualidade)
5. Fechamento (conduzir ao pagamento/compra)
Cada template deve ser curto, humano, com a abordagem certa e um próximo passo claro. Inclua dicas de quando usar.`,
  },
  {
    id: "pos-venda",
    category: "relacionamento",
    emoji: "🔁",
    label: "Pós-venda / Recompra",
    description: "Mensagens para gerar nova compra e indicação.",
    maxTokens: 2000,
    task: `Escreva mensagens de pós-venda para aumentar recompra e indicação.
Entregue:
1. Mensagem de agradecimento/onboarding (logo após a compra).
2. Mensagem de acompanhamento (checar satisfação e gerar prova/depoimento).
3. Oferta de recompra/upsell (com motivo para voltar a comprar).
4. Pedido de indicação (com um incentivo simples).
Mensagens curtas, calorosas e prontas para WhatsApp/e-mail.`,
  },
];

// ── Helpers ────────────────────────────────────────────────────────────

export function getAgent(id: string): Agent | undefined {
  return AGENTS.find((a) => a.id === id);
}

export function agentsByCategory(categoryId: CategoryId): Agent[] {
  return AGENTS.filter((a) => a.category === categoryId);
}

function dnaField(label: string, value: string): string {
  const v = value?.trim();
  return v ? `- ${label}: ${v}` : `- ${label}: (não informado)`;
}

/**
 * Monta o prompt de SISTEMA: define o papel do especialista, injeta TODO o
 * DNA da Campanha e dá as diretrizes de saída focadas em conversão.
 */
export function buildSystemPrompt(dna: CampaignDNAData): string {
  const business = dna.businessName?.trim() || "este negócio";

  return `Você é um especialista sênior em copywriting de resposta direta e marketing de alta conversão, com anos de experiência vendendo no digital para o mercado brasileiro. Você escreve para ${business}.

Seu trabalho é gerar material PRONTO PARA USAR, direto, persuasivo e que realmente vende — nada de texto genérico, raso ou com cara de "texto de IA".

## DNA da Campanha (o contexto deste negócio — use SEMPRE, em tudo que escrever)
${dnaField("Nome do negócio", dna.businessName)}
${dnaField("Produto/serviço", dna.product)}
${dnaField("Cliente ideal (quem é, dores, desejos)", dna.idealCustomer)}
${dnaField("Proposta de valor / diferencial", dna.valueProposition)}
${dnaField("Tom de voz", dna.toneOfVoice)}
${dnaField("Objeções comuns", dna.objections)}
${dnaField("Provas / resultados / cases", dna.proof)}
${dnaField("Concorrentes", dna.competitors)}

## Diretrizes de saída (obrigatórias)
- Escreva em português do Brasil, com naturalidade e linguagem do dia a dia do público.
- Use o tom de voz do DNA da Campanha de forma consistente.
- Foque em CONVERSÃO e VENDA. Use gatilhos com equilíbrio e honestidade: dor/desejo, prova social, status, autoridade, urgência e escassez.
- Venda o resultado e a transformação, não as características. Seja específico para este nicho.
- Antecipe e quebre as objeções do cliente quando fizer sentido.
- Entregue o material formatado e pronto para copiar e colar (use Markdown: títulos, listas, **negrito** onde ajudar).
- NÃO explique o que você está fazendo, não peça desculpas e não faça preâmbulos. Entregue apenas o material solicitado.
- Não invente provas, números ou garantias que não estejam no DNA; quando faltar, use linguagem persuasiva sem mentir.`;
}

/**
 * Monta a mensagem do USUÁRIO: a tarefa do agente + instruções extras.
 */
export function buildUserPrompt(agent: Agent, instructions: string): string {
  const extra = instructions?.trim();
  let prompt = `Tarefa (${agent.label}):\n${agent.task}`;
  if (extra) {
    prompt += `\n\n## Instruções adicionais do usuário (priorize-as)\n${extra}`;
  }
  return prompt;
}
