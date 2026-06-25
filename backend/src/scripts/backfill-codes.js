const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generatePlayerCode() {
  const MAX_ATTEMPTS = 10;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const digits = Math.floor(100000 + Math.random() * 900000);
    const code = `CM-${digits}`;
    const existing = await prisma.playerProfile.findUnique({ where: { playerCode: code } });
    if (!existing) return code;
  }
  return `CM-${Date.now().toString().slice(-6)}`;
}

async function main() {
  const profiles = await prisma.playerProfile.findMany({ where: { playerCode: null } });
  console.log(`Found ${profiles.length} profiles without a code.`);
  
  for (const profile of profiles) {
    const code = await generatePlayerCode();
    await prisma.playerProfile.update({
      where: { id: profile.id },
      data: { playerCode: code },
    });
    console.log(`Updated ${profile.username} with code ${code}`);
  }
  console.log('Done!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
