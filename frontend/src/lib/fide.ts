import { CalcOpponent, CalcResult } from '@/types';

export function getKFactor(rating: number, manual?: number): number {
  if (manual) return manual;
  if (rating >= 2400) return 10;
  if (rating >= 2000) return 20;
  return 40;
}

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export function calculateRating(
  myRating: number,
  opponents: CalcOpponent[],
  manualK?: number
): CalcResult {
  const K = getKFactor(myRating, manualK);
  let totalDelta = 0;

  const breakdown = opponents.map((opp) => {
    const exp = expectedScore(myRating, opp.rating);
    const delta = K * (opp.result - exp);
    totalDelta += delta;
    return { rating: opp.rating, result: opp.result, expected: exp, delta };
  });

  const roundedDelta = Math.round(totalDelta);
  return {
    newRating: myRating + roundedDelta,
    delta: roundedDelta,
    kFactor: K,
    breakdown,
  };
}
