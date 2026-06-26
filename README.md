# Minha Agência IA 🚀

Plataforma de marketing orientada a receita com **agentes de IA pré-configurados** que geram copy, anúncios, funis e conteúdo de **alta conversão** em português — sem você precisar escrever prompts longos toda vez.

Você seleciona um **nicho**, escolhe um **agente** (gerador de hooks, criador de anúncios, funil de vendas, VSL, etc.), adiciona instruções opcionais e recebe o conteúdo pronto, com **streaming em tempo real** e **histórico automático**. O tom de voz e o contexto de cada negócio ficam salvos em um **"DNA da Campanha"** reutilizável por todos os agentes.

---

## ✨ Principais recursos

- **Seletor de nicho** — alterne entre negócios; cada um tem cor de destaque própria.
- **Biblioteca de agentes** organizada em categorias (Conteúdo, Anúncios, Vendas, Relacionamento), com busca e filtro.
- **DNA da Campanha** — formulário persistente injetado automaticamente no prompt de **todos** os agentes do nicho.
- **Geração com streaming** — o texto aparece token a token, em tempo real.
- **Histórico automático** — toda geração é salva e pode ser revisitada, renomeada, organizada em pastas/projetos, favoritada e excluída.
- **Favoritar agentes** para acesso rápido.
- **Copiar, regenerar e exportar** (`.txt` / `.md`) cada resultado.
- **Design escuro, premium e responsivo** (funciona bem no celular), com foco no teclado, contraste adequado e respeito a `prefers-reduced-motion`.

---

## 🧱 Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS**
- **Anthropic SDK** (`@anthropic-ai/sdk`) — chamadas feitas **no servidor** (a API key nunca vai para o cliente)
- **Prisma + SQLite** — persistência local, sem banco externo
- **Streaming** das respostas da IA

---

## ⚡ Como rodar localmente

### 1. Pré-requisitos
- Node.js 18.18+ (recomendado 20+)

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure sua chave da Anthropic
1. Acesse [console.anthropic.com](https://console.anthropic.com/) → **Settings → API Keys** e crie uma chave.
2. Garanta que sua conta tem **créditos** em **Settings → Billing** (a geração de texto consome créditos).
3. Crie um arquivo **`.env.local`** na raiz do projeto (copie de `.env.example`):

```bash
cp .env.example .env.local
```

E coloque sua chave:
```env
ANTHROPIC_API_KEY=sk-ant-sua-chave-aqui
```

> 🔒 O arquivo `.env.local` está no `.gitignore` — sua chave **não** vai para o git.

### 4. Prepare o banco de dados (cria as tabelas e os 2 nichos de exemplo)
```bash
npm run setup
```
Isso roda `prisma generate`, cria o `prisma/dev.db` e popula com os dois nichos pré-cadastrados (Loja de iPhones Semi-Novos e App Fitness com IA), já com o DNA da Campanha preenchido.

### 5. Rode o servidor
```bash
npm run dev
```
Abra **http://localhost:3000**. 🎉

---

## 🤖 Modelo de IA

O modelo fica em uma **constante fácil de trocar** em `src/lib/anthropic.ts`:

```ts
export const MODELS = {
  quality: "claude-opus-4-8",   // máxima qualidade de copy (padrão)
  fast: "claude-sonnet-4-6",    // mais rápido/barato
};
```

- Na tela de geração você escolhe entre **Máxima** (qualidade) e **Rápida**.
- Para mudar o padrão global, edite `DEFAULT_MODEL` ou defina `ANTHROPIC_MODEL` no `.env.local`.
- O `max_tokens` é **configurável por agente** (em `src/lib/agents.ts`) — agentes que precisam de respostas longas (Página de Vendas, VSL) já vêm com mais tokens.

---

## ➕ Como adicionar um agente novo

A arquitetura é **extensível**: cada agente é um objeto em `src/lib/agents.ts`. Para criar um novo, **basta acrescentar um item ao array `AGENTS`**:

```ts
{
  id: "meu-agente",            // id único e estável
  category: "vendas",          // conteudo | anuncios | vendas | relacionamento
  emoji: "🔥",
  label: "Meu Agente",
  description: "O que ele faz, em uma linha.",
  maxTokens: 2000,             // tamanho máximo da resposta
  task: `Descreva aqui exatamente o que o agente deve gerar...`,
}
```

O papel de especialista e **todo o DNA da Campanha** são injetados automaticamente — você só descreve o entregável no campo `task`. A UI, a geração e o histórico se adaptam sozinhos.

### Como adicionar um nicho novo
Adicione um registro em `prisma/seed.ts` (ou crie pela interface no futuro) e rode `npm run db:seed`. Cada nicho tem nome, emoji, `accentColor` (cor de destaque) e seu DNA.

---

## 🗂️ Estrutura do projeto

```
prisma/
  schema.prisma      # modelos: Niche, CampaignDNA, Generation, Folder, Favorite
  seed.ts            # 2 nichos pré-cadastrados com DNA
src/
  app/
    api/             # route handlers (servidor): generate (streaming), niches, dna, ...
    layout.tsx
    page.tsx
    globals.css
  components/        # UI (AppShell, AgentGrid, GeneratePanel, DnaEditor, HistoryView)
  lib/
    agents.ts        # ⭐ biblioteca de agentes + montagem dos prompts
    anthropic.ts     # cliente + modelos + tratamento de erros
    prisma.ts
    types.ts
```

---

## ☁️ Como publicar na Vercel (testar no celular, etc.)

> ✅ **Só quer testar os agentes (inclusive pelo celular)?** Você precisa **apenas** da `ANTHROPIC_API_KEY`. A geração de conteúdo funciona **sem banco de dados** — os 2 nichos e seus DNAs já vêm embutidos no código como fallback. (O histórico, os favoritos e a edição do DNA só persistem com um banco — veja abaixo.)

1. Suba o projeto para um repositório no GitHub (já está feito).
2. Em [vercel.com](https://vercel.com), **Add New → Project** apontando para o repositório.
3. Em **Settings → Environment Variables**, adicione:
   - `ANTHROPIC_API_KEY` = sua chave (de console.anthropic.com, com créditos)
4. **Deploy.** Abra a URL gerada no navegador (Safari/Chrome do celular) e teste os agentes. 🎉

### Para histórico/favoritos persistentes (opcional, produção)
O SQLite local (`dev.db`) é ótimo na sua máquina, mas o sistema de arquivos da Vercel é efêmero. Para **persistir** histórico, favoritos e edições do DNA, use um banco gerenciado:
   - Crie um Postgres (ex.: Vercel Postgres, Neon ou Supabase).
   - Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `provider = "postgresql"`.
   - Defina `DATABASE_URL` nas variáveis de ambiente da Vercel apontando para esse banco.
   - Rode as migrações (`npx prisma db push`) contra o novo banco.
5. Faça o deploy. O `build` já roda `prisma generate` automaticamente.

> Para um teste rápido na Vercel ainda com SQLite, é possível, mas os dados podem se perder entre deploys/escalas — por isso recomendamos Postgres para uso real.

---

## 🛠️ Scripts úteis

| Comando | O que faz |
|---|---|
| `npm run dev` | Sobe o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção (`prisma generate` + `next build`) |
| `npm run start` | Sobe o build de produção |
| `npm run setup` | `prisma generate` + cria o banco + seed |
| `npm run db:seed` | Repopula os nichos de exemplo |
| `npm run db:reset` | Recria o banco do zero e popula novamente |

---

## ❓ Solução de problemas

- **"A chave da API da Anthropic não está configurada"** → crie o `.env.local` com `ANTHROPIC_API_KEY` e **reinicie** o `npm run dev`.
- **"Chave da API inválida"** → confira o valor da chave em console.anthropic.com.
- **"Sua conta Anthropic está sem créditos"** → adicione créditos em Settings → Billing.
- **Erro ao carregar nichos / tela de erro inicial** → rode `npm run setup` para criar o banco.
- **Rate limit (429)** → aguarde alguns segundos e gere novamente.

---

Feito para você ter orgulho de mostrar. Bora vender. 💸
