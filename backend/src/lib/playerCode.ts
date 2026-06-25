import prisma from './db';

/**
 * Generate a unique ChessMate player code in the format "CM-XXXXXX"
 * where X is a digit (0-9). Retries if a collision occurs.
 */
export async function generatePlayerCode(): Promise<string> {
  const MAX_ATTEMPTS = 10;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const digits = Math.floor(100000 + Math.random() * 900000); // 6-digit: 100000–999999
    const code = `CM-${digits}`;

    const existing = await prisma.playerProfile.findUnique({
      where: { playerCode: code },
      select: { id: true },
    });

    if (!existing) return code;
  }

  // Extremely unlikely fallback — append timestamp fragment
  const fallback = `CM-${Date.now().toString().slice(-6)}`;
  return fallback;
}
