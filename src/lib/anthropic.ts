import Anthropic from "@anthropic-ai/sdk";

/**
 * Configuração central de IA.
 *
 * Para trocar o modelo, mude `DEFAULT_MODEL` aqui (ou defina ANTHROPIC_MODEL
 * no .env.local). Os modelos abaixo são os atuais e mais capazes da Anthropic.
 *
 * - claude-opus-4-8  → máxima qualidade de copy (padrão). Mais caro/lento.
 * - claude-sonnet-4-6 → ótimo equilíbrio velocidade/custo. Bom para volume.
 */
export const MODELS = {
  quality: "claude-opus-4-8",
  fast: "claude-sonnet-4-6",
} as const;

export type ModelKey = keyof typeof MODELS;

// Modelo padrão: prioriza qualidade da copy. Sobrescrevível por env.
export const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL?.trim() || MODELS.quality;

/**
 * Resolve o id de modelo a partir de uma "chave" amigável vinda do cliente
 * (quality | fast). Qualquer valor desconhecido cai no DEFAULT_MODEL.
 */
export function resolveModel(key?: string): string {
  if (key === "fast") return MODELS.fast;
  if (key === "quality") return MODELS.quality;
  return DEFAULT_MODEL;
}

/** Cliente Anthropic — só deve ser usado no servidor. */
export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new MissingApiKeyError();
  }
  return new Anthropic({ apiKey });
}

export class MissingApiKeyError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY não configurada.");
    this.name = "MissingApiKeyError";
  }
}

/**
 * Traduz erros da SDK/HTTP em mensagens claras em português para o usuário.
 */
export function friendlyAiError(error: unknown): { status: number; message: string } {
  if (error instanceof MissingApiKeyError) {
    return {
      status: 500,
      message:
        "A chave da API da Anthropic não está configurada. Crie um arquivo .env.local com ANTHROPIC_API_KEY=... e reinicie o servidor.",
    };
  }

  if (error instanceof Anthropic.AuthenticationError) {
    return {
      status: 401,
      message:
        "Chave da API inválida. Verifique o valor de ANTHROPIC_API_KEY no .env.local (console.anthropic.com → API Keys).",
    };
  }

  if (error instanceof Anthropic.PermissionDeniedError) {
    return {
      status: 403,
      message:
        "Sua chave não tem permissão para usar este modelo. Confira o acesso ao modelo na sua conta Anthropic.",
    };
  }

  if (error instanceof Anthropic.RateLimitError) {
    return {
      status: 429,
      message:
        "Muitas requisições em pouco tempo (rate limit). Aguarde alguns segundos e tente gerar de novo.",
    };
  }

  if (error instanceof Anthropic.BadRequestError) {
    // Falta de créditos costuma vir como 400 de billing.
    const msg = String(error.message || "");
    if (/credit|billing|balance/i.test(msg)) {
      return {
        status: 402,
        message:
          "Sua conta Anthropic está sem créditos. Adicione créditos em console.anthropic.com → Billing.",
      };
    }
    return { status: 400, message: `Requisição inválida: ${error.message}` };
  }

  if (error instanceof Anthropic.APIConnectionError) {
    return {
      status: 503,
      message:
        "Falha de conexão com a Anthropic. Verifique sua internet e tente novamente.",
    };
  }

  if (error instanceof Anthropic.APIError) {
    return {
      status: error.status ?? 500,
      message: `Erro da API da Anthropic (${error.status ?? "?"}): ${error.message}`,
    };
  }

  return {
    status: 500,
    message:
      "Ocorreu um erro inesperado ao gerar o conteúdo. Tente novamente em instantes.",
  };
}
