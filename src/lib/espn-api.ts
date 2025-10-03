export interface ESPNGame {
  id: string;
  date: string;
  name: string;
  shortName: string;
  season: {
    year: number;
    type: number;
  };
  week: {
    number: number;
  };
  status: {
    type: {
      id: string;
      name: string;
      state: string;
      completed: boolean;
      description: string;
      detail: string;
      shortDetail: string;
    };
    period: number;
    clock: string;
  };
  competitions: Array<{
    id: string;
    date: string;
    attendance: number;
    competitors: Array<{
      id: string;
      uid: string;
      type: string;
      order: number;
      homeAway: string;
      winner: boolean;
      team: {
        id: string;
        uid: string;
        location: string;
        name: string;
        abbreviation: string;
        displayName: string;
        shortDisplayName: string;
        color: string;
        alternateColor: string;
        logo: string;
      };
      score: string;
      linescores?: Array<{
        value: number;
      }>;
      record?: Array<{
        name: string;
        abbreviation: string;
        type: string;
        summary: string;
      }>;
    }>;
    broadcasts?: Array<{
      market: string;
      names: string[];
    }>;
  }>;
}

export interface ESPNScoreboard {
  leagues: Array<{
    id: string;
    uid: string;
    name: string;
    abbreviation: string;
    season: {
      year: number;
      type: number;
    };
    calendar?: Array<{
      label: string;
      value: string;
      entries: Array<{
        label: string;
        detail: string;
        value: string;
        startDate: string;
        endDate: string;
      }>;
    }>;
  }>;
  season: {
    type: number;
    year: number;
  };
  week: {
    number: number;
  };
  events: ESPNGame[];
}

/**
 * Get current NFL week and season
 */
export async function getCurrentWeek(): Promise<{ week: number; season: number }> {
  try {
    const response = await fetch(
      'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard',
      { next: { revalidate: 300 } } // Cache for 5 minutes
    );
    
    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }

    const data: ESPNScoreboard = await response.json();
    
    return {
      week: data.week.number,
      season: data.season.year,
    };
  } catch (error) {
    console.error('Error fetching current week:', error);
    // Fallback to current year and week 1
    return {
      week: 1,
      season: new Date().getFullYear(),
    };
  }
}

/**
 * Get games for a specific week
 */
export async function getWeekGames(week: number, season: number): Promise<ESPNGame[]> {
  try {
    const response = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${season}&seasontype=2&week=${week}`,
      { cache: 'no-store' } // Always get fresh data
    );
    
    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status}`);
    }

    const data: ESPNScoreboard = await response.json();
    return data.events || [];
  } catch (error) {
    console.error('Error fetching week games:', error);
    return [];
  }
}

/**
 * Get live game data (called frequently during games)
 */
export async function getLiveGames(week: number, season: number): Promise<ESPNGame[]> {
  return getWeekGames(week, season);
}

/**
 * Check if a game is on Monday
 */
export function isMondayGame(game: ESPNGame): boolean {
  const gameDate = new Date(game.date);
  return gameDate.getDay() === 1; // Monday
}

/**
 * Get Monday games for a week
 */
export function getMondayGames(games: ESPNGame[]): ESPNGame[] {
  return games.filter(isMondayGame);
}

/**
 * Calculate total points from Monday games
 */
export function calculateMondayPoints(mondayGames: ESPNGame[]): number {
  return mondayGames.reduce((total, game) => {
    const competition = game.competitions[0];
    const homeScore = parseInt(competition.competitors.find(c => c.homeAway === 'home')?.score || '0');
    const awayScore = parseInt(competition.competitors.find(c => c.homeAway === 'away')?.score || '0');
    return total + homeScore + awayScore;
  }, 0);
}

/**
 * Get the first game time for a week (for lock time calculation)
 */
export function getFirstGameTime(games: ESPNGame[]): Date | null {
  if (games.length === 0) return null;
  
  const sortedGames = games.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  return new Date(sortedGames[0].date);
}

/**
 * Check if week is locked (5 minutes before first game)
 */
export function isWeekLocked(games: ESPNGame[]): boolean {
  const firstGameTime = getFirstGameTime(games);
  if (!firstGameTime) return false;
  
  const lockTime = new Date(firstGameTime.getTime() - 5 * 60 * 1000); // 5 minutes before
  return new Date() >= lockTime;
}

/**
 * Get lock time for a week (5 minutes before first game)
 */
export function getWeekLockTime(games: ESPNGame[]): Date | null {
  const firstGameTime = getFirstGameTime(games);
  if (!firstGameTime) return null;
  
  return new Date(firstGameTime.getTime() - 5 * 60 * 1000);
}

/**
 * Check if all games in a week are completed
 */
export function isWeekCompleted(games: ESPNGame[]): boolean {
  if (games.length === 0) return false;
  return games.every(game => game.status.type.completed);
}

/**
 * Get game status display text
 */
export function getGameStatusDisplay(game: ESPNGame): string {
  const status = game.status.type;
  
  if (status.completed) {
    return 'Final';
  }
  
  if (status.state === 'in') {
    // Game is live
    const period = game.status.period;
    const clock = game.status.clock;
    const quarter = period === 1 ? '1st' : period === 2 ? '2nd' : period === 3 ? '3rd' : period === 4 ? '4th' : 'OT';
    return `${quarter} ${clock}`;
  }
  
  // Game hasn't started
  return status.shortDetail;
}

/**
 * Get team by ID
 */
export function getTeam(game: ESPNGame, teamId: string) {
  return game.competitions[0].competitors.find(c => c.team.id === teamId);
}

/**
 * Check if a team won
 */
export function didTeamWin(game: ESPNGame, teamId: string): boolean | null {
  if (!game.status.type.completed) return null;
  
  const team = getTeam(game, teamId);
  return team?.winner || false;
}
