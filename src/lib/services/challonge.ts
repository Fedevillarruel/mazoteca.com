// ============================================================
// Challonge API Integration — Server-side only
// ============================================================
// Handles tournament creation, participant management, and bracket sync.
// Uses Challonge REST API v1.
// ============================================================

const CHALLONGE_BASE_URL = "https://api.challonge.com/v1";
const CHALLONGE_API_KEY = process.env.CHALLONGE_API_KEY!;

function buildUrl(path: string, params?: Record<string, string>): string {
  const url = new URL(`${CHALLONGE_BASE_URL}${path}.json`);
  url.searchParams.set("api_key", CHALLONGE_API_KEY);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
}

async function challongeFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Challonge API error (${response.status}): ${errorText}`
    );
  }

  return response.json() as Promise<T>;
}

// ---- Tournament Operations ----

export interface ChallongeTournament {
  tournament: {
    id: number;
    name: string;
    url: string;
    full_challonge_url: string;
    tournament_type: string;
    state: string;
    participants_count: number;
    started_at: string | null;
    completed_at: string | null;
  };
}

export interface CreateTournamentParams {
  name: string;
  tournament_type: "single elimination" | "double elimination" | "swiss" | "round robin";
  url?: string;
  description?: string;
  open_signup?: boolean;
  signup_cap?: number;
  game_name?: string;
}

export async function createTournament(
  params: CreateTournamentParams
): Promise<ChallongeTournament> {
  return challongeFetch<ChallongeTournament>(
    buildUrl("/tournaments"),
    {
      method: "POST",
      body: JSON.stringify({ tournament: params }),
    }
  );
}

export async function getTournament(
  tournamentId: string | number
): Promise<ChallongeTournament> {
  return challongeFetch<ChallongeTournament>(
    buildUrl(`/tournaments/${tournamentId}`)
  );
}

export async function startTournament(
  tournamentId: string | number
): Promise<ChallongeTournament> {
  return challongeFetch<ChallongeTournament>(
    buildUrl(`/tournaments/${tournamentId}/start`),
    { method: "POST" }
  );
}

export async function finalizeTournament(
  tournamentId: string | number
): Promise<ChallongeTournament> {
  return challongeFetch<ChallongeTournament>(
    buildUrl(`/tournaments/${tournamentId}/finalize`),
    { method: "POST" }
  );
}

export async function deleteTournament(
  tournamentId: string | number
): Promise<void> {
  await challongeFetch(
    buildUrl(`/tournaments/${tournamentId}`),
    { method: "DELETE" }
  );
}

// ---- Participant Operations ----

export interface ChallongeParticipant {
  participant: {
    id: number;
    name: string;
    seed: number;
    misc: string | null;
    final_rank: number | null;
  };
}

export async function addParticipant(
  tournamentId: string | number,
  name: string,
  misc?: string // we store the internal user_id here
): Promise<ChallongeParticipant> {
  return challongeFetch<ChallongeParticipant>(
    buildUrl(`/tournaments/${tournamentId}/participants`),
    {
      method: "POST",
      body: JSON.stringify({
        participant: { name, misc: misc || "" },
      }),
    }
  );
}

export async function removeParticipant(
  tournamentId: string | number,
  participantId: number
): Promise<void> {
  await challongeFetch(
    buildUrl(`/tournaments/${tournamentId}/participants/${participantId}`),
    { method: "DELETE" }
  );
}

export async function listParticipants(
  tournamentId: string | number
): Promise<ChallongeParticipant[]> {
  return challongeFetch<ChallongeParticipant[]>(
    buildUrl(`/tournaments/${tournamentId}/participants`)
  );
}

// ---- Match Operations ----

export interface ChallongeMatch {
  match: {
    id: number;
    round: number;
    state: string;
    player1_id: number | null;
    player2_id: number | null;
    winner_id: number | null;
    loser_id: number | null;
    scores_csv: string;
  };
}

export async function listMatches(
  tournamentId: string | number
): Promise<ChallongeMatch[]> {
  return challongeFetch<ChallongeMatch[]>(
    buildUrl(`/tournaments/${tournamentId}/matches`)
  );
}

export async function updateMatch(
  tournamentId: string | number,
  matchId: number,
  winnerId: number,
  scoresCsv: string
): Promise<ChallongeMatch> {
  return challongeFetch<ChallongeMatch>(
    buildUrl(`/tournaments/${tournamentId}/matches/${matchId}`),
    {
      method: "PUT",
      body: JSON.stringify({
        match: {
          winner_id: winnerId,
          scores_csv: scoresCsv,
        },
      }),
    }
  );
}

// ---- Utility ----

/**
 * Map Challonge tournament type to our internal format
 */
export function mapChallongeFormat(
  challongeType: string
): "swiss" | "single_elimination" | "double_elimination" | "round_robin" {
  switch (challongeType) {
    case "single elimination":
      return "single_elimination";
    case "double elimination":
      return "double_elimination";
    case "swiss":
      return "swiss";
    case "round robin":
      return "round_robin";
    default:
      return "swiss";
  }
}

/**
 * Map Challonge state to our internal tournament status
 */
export function mapChallongeState(
  challongeState: string
): "upcoming" | "registration_open" | "in_progress" | "completed" | "cancelled" {
  switch (challongeState) {
    case "pending":
      return "registration_open";
    case "underway":
      return "in_progress";
    case "complete":
      return "completed";
    default:
      return "upcoming";
  }
}
