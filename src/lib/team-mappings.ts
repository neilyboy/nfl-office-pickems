/**
 * Maps ESPN team abbreviations to logo/wordmark filenames
 */
export const TEAM_LOGO_MAP: Record<string, string> = {
  // AFC East
  'BUF': 'Buffalo_Bills',
  'MIA': 'Miami_Dolphins',
  'NE': 'New_England_Patriots',
  'NYJ': 'New_York_Jets',
  
  // AFC North
  'BAL': 'Baltimore_Ravens',
  'CIN': 'Cincinnati_Bengals',
  'CLE': 'Cleveland_Browns',
  'PIT': 'Pittsburgh_Steelers',
  
  // AFC South
  'HOU': 'Houston_Texans',
  'IND': 'Indianapolis_Colts',
  'JAX': 'Jacksonville_Jaguars',
  'TEN': 'Tennessee_Titans',
  
  // AFC West
  'DEN': 'Denver_Broncos',
  'KC': 'Kansas_City_Chiefs',
  'LV': 'Las_Vegas_Raiders',
  'LAC': 'Los_Angeles_Chargers',
  
  // NFC East
  'DAL': 'Dallas_Cowboys',
  'NYG': 'New_York_Giants',
  'PHI': 'Philadelphia_Eagles',
  'WSH': 'Washington_Commanders',
  
  // NFC North
  'CHI': 'Chicago_Bears',
  'DET': 'Detroit_Lions',
  'GB': 'Green_Bay_Packers',
  'MIN': 'Minnesota_Vikings',
  
  // NFC South
  'ATL': 'Atlanta_Falcons',
  'CAR': 'Carolina_Panthers',
  'NO': 'New_Orleans_Saints',
  'TB': 'Tampa_Bay_Buccaneers',
  
  // NFC West
  'ARI': 'Arizona_Cardinals',
  'LAR': 'Los_Angeles_Rams',
  'SF': 'San_Francisco_49ers',
  'SEA': 'Seattle_Seahawks',
};

/**
 * Get team logo path from ESPN abbreviation
 */
export function getTeamLogoPath(abbreviation: string): string {
  const teamName = TEAM_LOGO_MAP[abbreviation];
  if (!teamName) {
    console.warn(`Unknown team abbreviation: ${abbreviation}`);
    return '/team_logos/placeholder.svg';
  }
  return `/team_logos/${teamName}_logo.svg`;
}

/**
 * Get team wordmark path from ESPN abbreviation
 */
export function getTeamWordmarkPath(abbreviation: string): string {
  const teamName = TEAM_LOGO_MAP[abbreviation];
  if (!teamName) {
    console.warn(`Unknown team abbreviation: ${abbreviation}`);
    return '/team_wordmarks/placeholder.svg';
  }
  return `/team_wordmarks/${teamName}_wordmark.svg`;
}

/**
 * Get team color from abbreviation
 */
export function getTeamColor(abbreviation: string): string {
  const colors: Record<string, string> = {
    'ARI': '#97233F',
    'ATL': '#A71930',
    'BAL': '#241773',
    'BUF': '#00338D',
    'CAR': '#0085CA',
    'CHI': '#C83803',
    'CIN': '#FB4F14',
    'CLE': '#311D00',
    'DAL': '#041E42',
    'DEN': '#FB4F14',
    'DET': '#0076B6',
    'GB': '#203731',
    'HOU': '#03202F',
    'IND': '#002C5F',
    'JAX': '#006778',
    'KC': '#E31837',
    'LAC': '#0080C6',
    'LAR': '#003594',
    'LV': '#000000',
    'MIA': '#008E97',
    'MIN': '#4F2683',
    'NE': '#002244',
    'NO': '#D3BC8D',
    'NYG': '#0B2265',
    'NYJ': '#125740',
    'PHI': '#004C54',
    'PIT': '#FFB612',
    'SF': '#AA0000',
    'SEA': '#002244',
    'TB': '#D50A0A',
    'TEN': '#0C2340',
    'WSH': '#5A1414',
  };
  
  return colors[abbreviation] || '#3b82f6';
}
