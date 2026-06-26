import type { Agent } from "./agents";
import type { CampaignDNAData } from "./types";

/**
 * Modo Demonstração.
 *
 * Quando NÃO há ANTHROPIC_API_KEY configurada (ou DEMO_MODE=1), a geração
 * devolve um texto de EXEMPLO em vez de chamar a API paga. Serve para testar
 * a aplicação inteira (UI, streaming, copiar, exportar, histórico) de graça.
 *
 * O texto de exemplo é estático e apenas ilustrativo — a copy de verdade,
 * de alta conversão, vem da IA quando a chave da API está configurada.
 */

export function isDemoMode(): boolean {
  if (process.env.DEMO_MODE === "1") return true;
  return !process.env.ANTHROPIC_API_KEY;
}

export function demoSample(agent: Agent, dna: CampaignDNAData): string {
  const business = dna.businessName?.trim() || "seu negócio";

  const header = `> 🧪 **Modo demonstração** — este é um texto de exemplo (sem custo). Para gerar copy real de alta conversão, configure sua chave da Anthropic (\`ANTHROPIC_API_KEY\`).\n\n`;

  return header + (SAMPLES[agent.id]?.(business) ?? SAMPLES[agent.category]?.(business) ?? generic(business, agent.label));
}

type Tmpl = (business: string) => string;

function generic(business: string, label: string): string {
  return `## ${label} — exemplo\n\nConteúdo de exemplo gerado para **${business}**.\n\nEste agente, com a IA ativada, entrega material pronto para usar, persuasivo e específico para o seu negócio — puxando automaticamente o DNA da Campanha (público, dores, tom de voz e diferenciais).\n\n- Ponto 1: foco no benefício e no resultado\n- Ponto 2: quebra de objeções\n- Ponto 3: chamada para ação clara`;
}

const SAMPLES: Record<string, Tmpl> = {
  // Por agente (mais específicos)
  hooks: (b) => `## 5 Hooks que param o scroll — ${b}

1. **"Você está pagando caro à toa — e nem sabe."** (ângulo: dor)
2. **"O segredo de quem tem o melhor sem gastar uma fortuna."** (ângulo: desejo)
3. **"Ninguém te conta isso, mas..."** (ângulo: contra-intuitivo)
4. **"Mais de 3.000 pessoas já fizeram. Faltava você."** (ângulo: prova)
5. **"E se desse pra ter tudo isso hoje mesmo?"** (ângulo: pergunta provocativa)`,

  bio: (b) => `## 3 opções de bio — ${b}

**Opção 1**
✨ ${b}
✅ Resultado de verdade, sem complicação
👇 Comece agora (link na bio)

**Opção 2**
O jeito inteligente de conseguir o que você quer.
⭐ Aprovado por milhares de clientes.
🔗 Garanta o seu — link na bio.

**Opção 3**
Você merece o melhor. A gente entrega.
📩 Chama no direct ou clica no link da bio.`,

  // Por categoria (fallback)
  conteudo: (b) => `## Post de exemplo — ${b}

**Cansou de [problema do seu público]?** 👀

A real é que a maioria das pessoas continua presa nisso por um motivo simples: ninguém mostrou o caminho certo.

Com **${b}**, você resolve isso de um jeito prático — e ainda economiza tempo e dinheiro.

➡️ Comenta "EU QUERO" que eu te explico como funciona.

#exemplo #demonstracao`,

  anuncios: (b) => `## Anúncio de exemplo — ${b}

**Headline:** Pare de perder dinheiro com a escolha errada.

**Corpo:**
Você quer o melhor, mas sem pagar caro demais — e está certíssimo.
A ${b} resolve exatamente isso: qualidade, confiança e o melhor custo-benefício, com garantia de verdade.

Mais de 3.000 clientes já fizeram a escolha inteligente. Agora é a sua vez.

**CTA:** 👉 Toque em "Saiba mais" e garanta o seu hoje.

**Criativo sugerido:** vídeo curto mostrando o produto em uso, com depoimento real sobreposto.`,

  vendas: (b) => `## Oferta de exemplo — ${b}

**A oferta:** Tudo o que você precisa para [resultado desejado], em um só lugar.

**Ancoragem de valor:**
- Item principal — ~~R$ 497~~
- Bônus 1: [acelerador de resultado] — R$ 197
- Bônus 2: [suporte/garantia] — R$ 147
- **Hoje, tudo por R$ 197**

**Garantia:** 7 dias para testar. Não gostou? Devolvemos 100%.

**Escassez:** condição válida apenas esta semana.

**CTA:** Quero garantir minha vaga agora →`,

  relacionamento: (b) => `## Respostas de DM/WhatsApp — ${b}

**1. Primeiro contato**
"Oi! Vi seu interesse 😊 Posso te explicar rapidinho como a ${b} funciona pra ver se faz sentido pra você?"

**2. "Quanto custa?"**
"Ótima pergunta! Depende do que você precisa — me conta seu objetivo que eu te mostro a melhor opção (e hoje tem condição especial)."

**3. "Vou pensar"**
"Claro, sem pressa! Só pra eu te ajudar melhor: o que te deixou em dúvida — preço, garantia ou outra coisa?"

**4. Fechamento**
"Perfeito! Posso reservar o seu agora. Prefere pagar no Pix ou no cartão?"`,
};
