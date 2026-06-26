import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getAnthropicClient,
  resolveModel,
  friendlyAiError,
} from "@/lib/anthropic";
import {
  getAgent,
  buildSystemPrompt,
  buildUserPrompt,
} from "@/lib/agents";
import { EMPTY_DNA, type CampaignDNAData } from "@/lib/types";
import { getDefaultNiche } from "@/lib/niches";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/generate
 * body: { nicheId, agentId, instructions?, model? }
 *
 * Faz a chamada à Anthropic NO SERVIDOR (a API key nunca vai pro cliente)
 * e devolve o texto da copy via streaming (token a token).
 */
export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return jsonError(400, "Corpo da requisição inválido.");
  }

  const nicheId = String(body?.nicheId ?? "");
  const agentId = String(body?.agentId ?? "");
  const instructions = String(body?.instructions ?? "");
  const modelKey = typeof body?.model === "string" ? body.model : undefined;

  const agent = getAgent(agentId);
  if (!agent) return jsonError(400, "Agente desconhecido.");
  if (!nicheId) return jsonError(400, "Selecione um nicho antes de gerar.");

  // Carrega o DNA da Campanha do nicho (injetado no prompt de todos os agentes).
  // Ordem: 1) banco (se disponível)  2) nicho padrão em código (fallback).
  // Assim a geração funciona mesmo sem banco persistente (ex.: deploy de teste).
  let dna: CampaignDNAData | null = null;
  try {
    const niche = await prisma.niche.findUnique({
      where: { id: nicheId },
      include: { dna: true },
    });
    if (niche?.dna) {
      dna = {
        businessName: niche.dna.businessName,
        product: niche.dna.product,
        idealCustomer: niche.dna.idealCustomer,
        valueProposition: niche.dna.valueProposition,
        toneOfVoice: niche.dna.toneOfVoice,
        objections: niche.dna.objections,
        proof: niche.dna.proof,
        competitors: niche.dna.competitors,
      };
    }
  } catch {
    // banco indisponível — segue para o fallback em código
  }

  if (!dna) {
    const fallback = getDefaultNiche(nicheId);
    if (fallback) {
      dna = fallback.dna;
    }
  }

  if (!dna) {
    // Nicho não está no banco nem nos padrões; gera com DNA vazio
    // (o agente ainda funciona, só sem contexto do negócio).
    dna = { ...EMPTY_DNA };
  }

  // Monta a chamada de IA.
  let client;
  try {
    client = getAnthropicClient();
  } catch (error) {
    const { status, message } = friendlyAiError(error);
    return jsonError(status, message);
  }

  const model = resolveModel(modelKey);
  const system = buildSystemPrompt(dna);
  const userPrompt = buildUserPrompt(agent, instructions);

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const aiStream = client.messages.stream({
          model,
          max_tokens: agent.maxTokens,
          system,
          messages: [{ role: "user", content: userPrompt }],
        });

        for await (const event of aiStream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      } catch (error) {
        console.error("generate: stream", error);
        const { message } = friendlyAiError(error);
        // Sinaliza o erro dentro do stream para o cliente exibir.
        controller.enqueue(encoder.encode(`\n\n__ERRO__:${message}`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}

function jsonError(status: number, message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
