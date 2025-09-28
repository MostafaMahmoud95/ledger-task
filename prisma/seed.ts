import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.ledger.findFirst();
  if (!existing) {
    await prisma.ledger.create({ data: { balancePiasters: 0 } });
    console.log('Created initial balance row with 0 balance');
  } else {
    console.log('Ledger row exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
