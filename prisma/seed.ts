/**
 * Seed: pré-cadastra os nichos com o DNA da Campanha preenchido.
 * A fonte da verdade é src/lib/niches.ts (também usado como fallback sem banco).
 * Rode com: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { DEFAULT_NICHES } from "../src/lib/niches";

const prisma = new PrismaClient();

async function main() {
  for (const n of DEFAULT_NICHES) {
    await prisma.niche.upsert({
      where: { slug: n.slug },
      update: {},
      create: {
        slug: n.slug,
        name: n.name,
        emoji: n.emoji,
        accentColor: n.accentColor,
        dna: { create: { ...n.dna } },
      },
    });
  }

  console.log(
    `✅ Seed concluído: ${DEFAULT_NICHES.length} nichos com DNA da Campanha pré-preenchido.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
