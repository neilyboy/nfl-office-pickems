export interface Theme {
  id: string;
  name: string;
  type: 'base' | 'team';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    muted: string;
    mutedForeground: string;
    border: string;
  };
}

// Base Themes
export const BASE_THEMES: Record<string, Theme> = {
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    type: 'base',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#334155',
    },
  },
  light: {
    id: 'light',
    name: 'Light Mode',
    type: 'base',
    colors: {
      primary: '#3b82f6',
      secondary: '#6366f1',
      accent: '#8b5cf6',
      background: '#ffffff',
      foreground: '#0f172a',
      card: '#f8fafc',
      cardForeground: '#0f172a',
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
      border: '#e2e8f0',
    },
  },
  'high-contrast': {
    id: 'high-contrast',
    name: 'High Contrast',
    type: 'base',
    colors: {
      primary: '#ffffff',
      secondary: '#ffff00',
      accent: '#00ffff',
      background: '#000000',
      foreground: '#ffffff',
      card: '#1a1a1a',
      cardForeground: '#ffffff',
      muted: '#333333',
      mutedForeground: '#ffffff',
      border: '#ffffff',
    },
  },
};

// NFL Team Themes (All 32 Teams with Official Colors)
export const NFL_TEAM_THEMES: Record<string, Theme> = {
  'arizona-cardinals': {
    id: 'arizona-cardinals',
    name: 'Arizona Cardinals',
    type: 'team',
    colors: {
      primary: '#97233F',
      secondary: '#000000',
      accent: '#FFB612',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#97233F',
    },
  },
  'atlanta-falcons': {
    id: 'atlanta-falcons',
    name: 'Atlanta Falcons',
    type: 'team',
    colors: {
      primary: '#A71930',
      secondary: '#000000',
      accent: '#A5ACAF',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#A71930',
    },
  },
  'baltimore-ravens': {
    id: 'baltimore-ravens',
    name: 'Baltimore Ravens',
    type: 'team',
    colors: {
      primary: '#241773',
      secondary: '#000000',
      accent: '#9E7C0C',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#241773',
    },
  },
  'buffalo-bills': {
    id: 'buffalo-bills',
    name: 'Buffalo Bills',
    type: 'team',
    colors: {
      primary: '#00338D',
      secondary: '#C60C30',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#00338D',
    },
  },
  'carolina-panthers': {
    id: 'carolina-panthers',
    name: 'Carolina Panthers',
    type: 'team',
    colors: {
      primary: '#0085CA',
      secondary: '#000000',
      accent: '#BFC0BF',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#0085CA',
    },
  },
  'chicago-bears': {
    id: 'chicago-bears',
    name: 'Chicago Bears',
    type: 'team',
    colors: {
      primary: '#0B162A',
      secondary: '#C83803',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#C83803',
    },
  },
  'cincinnati-bengals': {
    id: 'cincinnati-bengals',
    name: 'Cincinnati Bengals',
    type: 'team',
    colors: {
      primary: '#FB4F14',
      secondary: '#000000',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#FB4F14',
    },
  },
  'cleveland-browns': {
    id: 'cleveland-browns',
    name: 'Cleveland Browns',
    type: 'team',
    colors: {
      primary: '#311D00',
      secondary: '#FF3C00',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#FF3C00',
    },
  },
  'dallas-cowboys': {
    id: 'dallas-cowboys',
    name: 'Dallas Cowboys',
    type: 'team',
    colors: {
      primary: '#041E42',
      secondary: '#869397',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#041E42',
    },
  },
  'denver-broncos': {
    id: 'denver-broncos',
    name: 'Denver Broncos',
    type: 'team',
    colors: {
      primary: '#FB4F14',
      secondary: '#002244',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#FB4F14',
    },
  },
  'detroit-lions': {
    id: 'detroit-lions',
    name: 'Detroit Lions',
    type: 'team',
    colors: {
      primary: '#0076B6',
      secondary: '#B0B7BC',
      accent: '#000000',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#0076B6',
    },
  },
  'green-bay-packers': {
    id: 'green-bay-packers',
    name: 'Green Bay Packers',
    type: 'team',
    colors: {
      primary: '#203731',
      secondary: '#FFB612',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#FFB612',
    },
  },
  'houston-texans': {
    id: 'houston-texans',
    name: 'Houston Texans',
    type: 'team',
    colors: {
      primary: '#03202F',
      secondary: '#A71930',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#A71930',
    },
  },
  'indianapolis-colts': {
    id: 'indianapolis-colts',
    name: 'Indianapolis Colts',
    type: 'team',
    colors: {
      primary: '#002C5F',
      secondary: '#A2AAAD',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#002C5F',
    },
  },
  'jacksonville-jaguars': {
    id: 'jacksonville-jaguars',
    name: 'Jacksonville Jaguars',
    type: 'team',
    colors: {
      primary: '#006778',
      secondary: '#101820',
      accent: '#D7A22A',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#006778',
    },
  },
  'kansas-city-chiefs': {
    id: 'kansas-city-chiefs',
    name: 'Kansas City Chiefs',
    type: 'team',
    colors: {
      primary: '#E31837',
      secondary: '#FFB81C',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#E31837',
    },
  },
  'las-vegas-raiders': {
    id: 'las-vegas-raiders',
    name: 'Las Vegas Raiders',
    type: 'team',
    colors: {
      primary: '#000000',
      secondary: '#A5ACAF',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#A5ACAF',
    },
  },
  'los-angeles-chargers': {
    id: 'los-angeles-chargers',
    name: 'Los Angeles Chargers',
    type: 'team',
    colors: {
      primary: '#0080C6',
      secondary: '#FFC20E',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#0080C6',
    },
  },
  'los-angeles-rams': {
    id: 'los-angeles-rams',
    name: 'Los Angeles Rams',
    type: 'team',
    colors: {
      primary: '#003594',
      secondary: '#FFA300',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#003594',
    },
  },
  'miami-dolphins': {
    id: 'miami-dolphins',
    name: 'Miami Dolphins',
    type: 'team',
    colors: {
      primary: '#008E97',
      secondary: '#FC4C02',
      accent: '#005778',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#008E97',
    },
  },
  'minnesota-vikings': {
    id: 'minnesota-vikings',
    name: 'Minnesota Vikings',
    type: 'team',
    colors: {
      primary: '#4F2683',
      secondary: '#FFC62F',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#4F2683',
    },
  },
  'new-england-patriots': {
    id: 'new-england-patriots',
    name: 'New England Patriots',
    type: 'team',
    colors: {
      primary: '#002244',
      secondary: '#C60C30',
      accent: '#B0B7BC',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#C60C30',
    },
  },
  'new-orleans-saints': {
    id: 'new-orleans-saints',
    name: 'New Orleans Saints',
    type: 'team',
    colors: {
      primary: '#D3BC8D',
      secondary: '#101820',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#D3BC8D',
    },
  },
  'new-york-giants': {
    id: 'new-york-giants',
    name: 'New York Giants',
    type: 'team',
    colors: {
      primary: '#0B2265',
      secondary: '#A71930',
      accent: '#A5ACAF',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#0B2265',
    },
  },
  'new-york-jets': {
    id: 'new-york-jets',
    name: 'New York Jets',
    type: 'team',
    colors: {
      primary: '#125740',
      secondary: '#000000',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#125740',
    },
  },
  'philadelphia-eagles': {
    id: 'philadelphia-eagles',
    name: 'Philadelphia Eagles',
    type: 'team',
    colors: {
      primary: '#004C54',
      secondary: '#A5ACAF',
      accent: '#000000',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#004C54',
    },
  },
  'pittsburgh-steelers': {
    id: 'pittsburgh-steelers',
    name: 'Pittsburgh Steelers',
    type: 'team',
    colors: {
      primary: '#FFB612',
      secondary: '#101820',
      accent: '#C60C30',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#FFB612',
    },
  },
  'san-francisco-49ers': {
    id: 'san-francisco-49ers',
    name: 'San Francisco 49ers',
    type: 'team',
    colors: {
      primary: '#AA0000',
      secondary: '#B3995D',
      accent: '#000000',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#AA0000',
    },
  },
  'seattle-seahawks': {
    id: 'seattle-seahawks',
    name: 'Seattle Seahawks',
    type: 'team',
    colors: {
      primary: '#002244',
      secondary: '#69BE28',
      accent: '#A5ACAF',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#69BE28',
    },
  },
  'tampa-bay-buccaneers': {
    id: 'tampa-bay-buccaneers',
    name: 'Tampa Bay Buccaneers',
    type: 'team',
    colors: {
      primary: '#D50A0A',
      secondary: '#FF7900',
      accent: '#0A0A08',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#D50A0A',
    },
  },
  'tennessee-titans': {
    id: 'tennessee-titans',
    name: 'Tennessee Titans',
    type: 'team',
    colors: {
      primary: '#0C2340',
      secondary: '#4B92DB',
      accent: '#C8102E',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#4B92DB',
    },
  },
  'washington-commanders': {
    id: 'washington-commanders',
    name: 'Washington Commanders',
    type: 'team',
    colors: {
      primary: '#5A1414',
      secondary: '#FFB612',
      accent: '#ffffff',
      background: '#0f172a',
      foreground: '#f1f5f9',
      card: '#1e293b',
      cardForeground: '#f1f5f9',
      muted: '#334155',
      mutedForeground: '#94a3b8',
      border: '#5A1414',
    },
  },
};

export const ALL_THEMES = {
  ...BASE_THEMES,
  ...NFL_TEAM_THEMES,
};

export function getTheme(themeId: string): Theme {
  return ALL_THEMES[themeId] || BASE_THEMES.dark;
}

// Convert hex color to HSL format that Tailwind expects (without hsl() wrapper)
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace(/^#/, '');
  
  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  
  // Convert and apply CSS variables in HSL format
  root.style.setProperty('--primary', hexToHSL(theme.colors.primary));
  root.style.setProperty('--primary-foreground', hexToHSL(theme.colors.foreground));
  root.style.setProperty('--secondary', hexToHSL(theme.colors.secondary));
  root.style.setProperty('--secondary-foreground', hexToHSL(theme.colors.foreground));
  root.style.setProperty('--accent', hexToHSL(theme.colors.accent));
  root.style.setProperty('--accent-foreground', hexToHSL(theme.colors.foreground));
  root.style.setProperty('--background', hexToHSL(theme.colors.background));
  root.style.setProperty('--foreground', hexToHSL(theme.colors.foreground));
  root.style.setProperty('--card', hexToHSL(theme.colors.card));
  root.style.setProperty('--card-foreground', hexToHSL(theme.colors.cardForeground));
  root.style.setProperty('--muted', hexToHSL(theme.colors.muted));
  root.style.setProperty('--muted-foreground', hexToHSL(theme.colors.mutedForeground));
  root.style.setProperty('--border', hexToHSL(theme.colors.border));
  root.style.setProperty('--input', hexToHSL(theme.colors.muted));
  root.style.setProperty('--ring', hexToHSL(theme.colors.primary));
  root.style.setProperty('--popover', hexToHSL(theme.colors.card));
  root.style.setProperty('--popover-foreground', hexToHSL(theme.colors.cardForeground));
  
  // Update class for light mode
  if (theme.id === 'light') {
    root.classList.remove('dark');
    root.classList.add('light');
  } else {
    root.classList.remove('light');
    root.classList.add('dark');
  }
}
