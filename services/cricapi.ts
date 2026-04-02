import { cached } from './cache';

const BASE_URL = 'https://api.cricapi.com/v1';
const API_KEY = process.env.EXPO_PUBLIC_CRICAPI_KEY ?? '';
const IPL_SERIES_ID = '87c62aac-bc3c-4738-ab93-19da0690488f';

const TTL_LIVE = 60_000;
const TTL_STATIC = 300_000;

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const query = new URLSearchParams({ apikey: API_KEY, ...params }).toString();
  const res = await fetch(`${BASE_URL}${path}?${query}`);
  if (!res.ok) throw new Error(`CricAPI error: ${res.status}`);
  const json = await res.json();
  if (json.status !== 'success') throw new Error(json.reason ?? 'API error');
  return json.data as T;
}

export interface Match {
  id: string;
  name: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo?: { name: string; img: string; shortname: string }[];
  score?: { r: number; w: number; o: number; inning: string }[];
  matchType: string;
  matchStarted: boolean;
  matchEnded: boolean;
  series_id?: string;
}

export interface MatchDetail extends Match {
  tossWinner?: string;
  tossChoice?: string;
  matchWinner?: string;
}

export interface TeamStanding {
  teamId: string;
  teamName: string;
  teamSName: string;
  img: string;
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  nrr: string;
  points: number;
}

export interface Player {
  id: string;
  name: string;
  country: string;
  playerImg: string;
  role: string;
}

export interface NewsItem {
  id: string;
  title: string;
  intro: string;
  pubDate: string;
  imageurl: string;
  url: string;
  source: string;
}

// --- Matches ---

export function getMatches(): Promise<Match[]> {
  return cached('ipl_matches', TTL_LIVE, async () => {
    const all = await get<Match[]>('/currentMatches', { offset: '0' });
    return (all ?? []).filter((m) => m.series_id === IPL_SERIES_ID);
  });
}

export function getMatchDetail(id: string): Promise<MatchDetail> {
  return cached(`match:${id}`, TTL_LIVE, () =>
    get<MatchDetail>('/match_info', { id })
  );
}

// --- Points table (computed from match results) ---

function buildPointsTable(matches: Match[]): TeamStanding[] {
  const teams: Record<string, { name: string; img: string; shortname: string; played: number; won: number; lost: number }> = {};

  for (const match of matches) {
    for (const info of match.teamInfo ?? []) {
      if (!teams[info.name]) {
        teams[info.name] = { name: info.name, img: info.img, shortname: info.shortname, played: 0, won: 0, lost: 0 };
      }
    }
  }

  for (const match of matches.filter((m) => m.matchEnded)) {
    const winnerMatch = /^(.+?) won by/.exec(match.status);
    if (!winnerMatch) continue;
    const winner = winnerMatch[1].trim();
    for (const teamName of match.teams) {
      if (!teams[teamName]) continue;
      teams[teamName].played++;
      if (teamName === winner) teams[teamName].won++;
      else teams[teamName].lost++;
    }
  }

  return Object.values(teams)
    .map((t) => ({
      teamId: t.name,
      teamName: t.name,
      teamSName: t.shortname,
      img: t.img,
      matchesPlayed: t.played,
      matchesWon: t.won,
      matchesLost: t.lost,
      nrr: '+0.000',
      points: t.won * 2,
    }))
    .sort((a, b) => b.points - a.points || b.matchesWon - a.matchesWon);
}

export async function getPointsTable(): Promise<TeamStanding[]> {
  return cached('ipl_points', TTL_LIVE, async () => {
    const matches = await getMatches();
    return buildPointsTable(matches);
  });
}

// --- Players ---

export function getPlayerStats(): Promise<Player[]> {
  return cached('ipl_players', TTL_STATIC, () =>
    get<Player[]>('/players', { search: 'india', offset: '0' })
  );
}

// --- News (Google News RSS — no API key needed) ---

function parseRSS(xml: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  let i = 0;
  while ((match = itemRegex.exec(xml)) !== null && i < 25) {
    const block = match[1];
    const title =
      (/<title><!\[CDATA\[(.+?)\]\]><\/title>/s.exec(block) ||
        /<title>(.+?)<\/title>/s.exec(block))?.[1]?.trim() ?? '';
    const link = /<link>(https?:\/\/.+?)<\/link>/s.exec(block)?.[1]?.trim() ?? '';
    const pubDate = /<pubDate>(.+?)<\/pubDate>/s.exec(block)?.[1]?.trim() ?? '';
    const source = /<source[^>]*>(.*?)<\/source>/s.exec(block)?.[1]?.trim() ?? 'Cricket News';
    if (title) {
      items.push({ id: `news-${i}`, title, intro: '', pubDate, imageurl: '', url: link, source });
      i++;
    }
  }
  return items;
}

export async function getNews(): Promise<NewsItem[]> {
  return cached('ipl_news', TTL_STATIC, async () => {
    const url =
      'https://news.google.com/rss/search?q=IPL+2026+cricket&hl=en-IN&gl=IN&ceid=IN:en';
    const res = await fetch(url);
    const xml = await res.text();
    return parseRSS(xml);
  });
}
