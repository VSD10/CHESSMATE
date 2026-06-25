export type TournamentStatus = 'UPCOMING' | 'OPEN' | 'ONGOING' | 'COMPLETED';
export type TournamentFormat = 'SWISS' | 'ROUND_ROBIN' | 'KNOCKOUT' | 'BLITZ' | 'RAPID' | 'CLASSICAL';

export interface Prize {
  position: string;
  amount: string;
}

export interface TournamentDetail {
  id: string;
  tournamentId: string;
  venue: string;
  venueMapUrl?: string;
  chiefArbiter: string;
  organizingCommittee?: string;
  organizer: string;
  registrationLink?: string;
  resultsLink?: string;
  rules?: string;
  prizes: Prize[];
}

export interface Tournament {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  startDate: string;
  endDate: string;
  format: TournamentFormat;
  rounds: number;
  timeControl: string;
  category: string;
  fideRated: boolean;
  entryFee: string;
  prizePool: string;
  status: TournamentStatus;
  posterUrl?: string;
  emoji: string;
  about: string;
  detail?: TournamentDetail;
}

export interface TournamentsResponse {
  data: Tournament[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface RatingEntry {
  id: string;
  rating: number;
  date: string;
  tournamentName?: string;
  delta: number;
  result?: string;
}

export interface PlayerProfile {
  id: string;
  username: string;
  playerCode: string;
  currentRating: number;
  peakRating: number;
  totalTournaments: number;
  winRate: number;
  avatarUrl?: string;
  bio?: string;
  user: { name: string; email: string; fideId?: string };
  ratingHistory: RatingEntry[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'PLAYER';
  username?: string;
  playerCode?: string;
}

export interface CalcOpponent {
  id: string;
  rating: number;
  result: 1 | 0.5 | 0;
}

export interface CalcResult {
  newRating: number;
  delta: number;
  kFactor: number;
  breakdown: Array<{
    rating: number;
    result: number;
    expected: number;
    delta: number;
  }>;
}
