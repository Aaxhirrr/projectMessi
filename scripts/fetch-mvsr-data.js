#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BASE_URL = 'https://www.messivsronaldo.app/page-data';
const OUTPUT_PATH = join(process.cwd(), 'data', 'mvsr-data.json');

const ENDPOINTS = {
  index: '/index/page-data.json',
  progression: '/all-time-stats/progression/page-data.json',
};

const fetchJson = async (path) => {
  const url = `${BASE_URL}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.json();
};

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return value;
  const sanitized = String(value).replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(sanitized);
  return Number.isFinite(parsed) ? parsed : 0;
};

const round = (value, decimals = 2) => {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
};

const parseAllTimeStats = (edges) =>
  edges.map(({ node }) => {
    const goals = toNumber(node.goals);
    const assists = toNumber(node.assists);
    const minsPlayed = toNumber(node.minsPlayed);
    const ga = goals + assists;
    const gaPer90 = minsPlayed ? ga / (minsPlayed / 90) : 0;

    return {
      competition: node.competition,
      goals,
      assists,
      ga,
      apps: toNumber(node.apps),
      goalsPerGame: round(toNumber(node.goalsPerGame) || (node.apps ? goals / toNumber(node.apps) : 0), 3),
      minsPerGoal: round(toNumber(node.minsPerGoal), 3),
      minsPerGoalContribution: round(toNumber(node.minsPerGoalContribution), 3),
      minsPlayed,
      pens: toNumber(node.pens),
      pensMissed: toNumber(node.pensMissed),
      hatTricks: toNumber(node.hatTricks),
      freeKicks: toNumber(node.freeKicks),
      insideBox: toNumber(node.insideBox),
      outsideBox: toNumber(node.outsideBox),
      leftFoot: toNumber(node.left),
      rightFoot: toNumber(node.right),
      headers: toNumber(node.head),
      other: toNumber(node.other),
      shots: toNumber(node.shots),
      shotsOnTarget: toNumber(node.shotsOnTarget),
      keyPasses: toNumber(node.keyPasses),
      successfulDribbles: toNumber(node.successfulDribbles),
      throughballs: toNumber(node.throughballs),
      aerialDuels: toNumber(node.aerialDuels),
      motm: toNumber(node.motm),
      avgRating: round(toNumber(node.avgRating), 3),
      freeKickAttempts: toNumber(node.freeKickAttempts),
      xg: toNumber(node.xg),
      xa: toNumber(node.xa),
      bigChancesCreated: toNumber(node.bigChancesCreated),
      gaPer90: round(gaPer90, 3),
    };
  });

const aggregateSeasons = (edges) => {
  const map = new Map();
  edges.forEach(({ node }) => {
    const seasonRaw = (node.season || '').trim();
    const year = (node.year || '').trim();
    const inferredSeason = seasonRaw || (year ? inferSeasonFromYear(year) : 'Unknown');

    const goals = toNumber(node.goals);
    const assists = toNumber(node.assists);
    const pens = toNumber(node.pens);

    if (!map.has(inferredSeason)) {
      map.set(inferredSeason, {
        season: inferredSeason,
        goals: 0,
        assists: 0,
        ga: 0,
        pens: 0,
        matches: 0,
      });
    }

    const entry = map.get(inferredSeason);
    entry.goals += goals;
    entry.assists += assists;
    entry.ga += goals + assists;
    entry.pens += pens;
    entry.matches += 1;
  });

  return Array.from(map.values())
    .map((entry) => ({
      ...entry,
      goals: Number(entry.goals),
      assists: Number(entry.assists),
      ga: Number(entry.ga),
      pens: Number(entry.pens),
      matches: Number(entry.matches),
    }))
    .sort((a, b) => a.season.localeCompare(b.season));
};

const inferSeasonFromYear = (yearString) => {
  const year = Number.parseInt(yearString, 10);
  if (!Number.isFinite(year)) return 'Unknown';
  const next = String(year + 1).slice(-2).padStart(2, '0');
  return `${year}-${next}`;
};

const selectTotals = (breakdown, label = 'All Time Career') => {
  const totals = breakdown.find((item) => item.competition === label);
  if (!totals) {
    throw new Error(`Unable to locate totals for ${label}`);
  }
  return totals;
};

const mapHonours = (edges) => {
  const map = new Map();
  edges.forEach(({ node }) => {
    map.set(node.honour, {
      title: node.honour,
      messi: toNumber(node.mcount),
      ronaldo: toNumber(node.rcount),
      type: node.type,
      awardType: node.awardType,
      messiYears: node.myears,
      ronaldoYears: node.ryears,
    });
  });
  return map;
};

const pickCounts = (map, key) => {
  const entry = map.get(key);
  return {
    messi: entry ? toNumber(entry.messi) : 0,
    ronaldo: entry ? toNumber(entry.ronaldo) : 0,
  };
};

const pickHonour = (map, key) => {
  const entry = map.get(key);
  return entry
    ? {
        title: entry.title,
        messi: entry.messi,
        ronaldo: entry.ronaldo,
        type: entry.type,
        awardType: entry.awardType,
        messiYears: entry.messiYears,
        ronaldoYears: entry.ronaldoYears,
      }
    : null;
};

const buildPlayerProfile = (name, breakdown, seasons, accolades) => {
  const totals = selectTotals(breakdown);
  return {
    name,
    totals,
    breakdown,
    seasons,
    topSeasons: seasons
      .slice()
      .sort((a, b) => b.ga - a.ga)
      .slice(0, 6),
    accolades,
  };
};

const filterHonoursBy = (edges, predicate) =>
  edges
    .filter(({ node }) => predicate(node))
    .map(({ node }) => ({
      title: node.honour,
      messi: toNumber(node.mcount),
      ronaldo: toNumber(node.rcount),
      type: node.type,
      awardType: node.awardType,
    }));

const main = async () => {
  console.log('Fetching Messi vs Ronaldo datasets...');
  const [indexData, progressionData] = await Promise.all([
    fetchJson(ENDPOINTS.index),
    fetchJson(ENDPOINTS.progression),
  ]);

  const messiStatsEdges = indexData.result.data.allSheetMessiAllTimeStats.edges;
  const ronaldoStatsEdges = indexData.result.data.allSheetRonaldoAllTimeStats.edges;
  const honoursEdges = indexData.result.data.allSheetHonours.edges;

  const messiBreakdown = parseAllTimeStats(messiStatsEdges);
  const ronaldoBreakdown = parseAllTimeStats(ronaldoStatsEdges);

  const messiSeasons = aggregateSeasons(progressionData.result.data.allSheetMessiMatchHistory.edges);
  const ronaldoSeasons = aggregateSeasons(progressionData.result.data.allSheetRonaldoMatchHistory.edges);

  const honoursMap = mapHonours(honoursEdges);

  const totalTrophies = pickHonour(honoursMap, 'Total Trophies');
  const ballonDor = pickHonour(honoursMap, "Ballon d'Or");
  const fifaBest = pickHonour(honoursMap, 'FIFA World Player of the Year');
  const goldenShoe = pickHonour(honoursMap, 'European Golden Shoe');

  const players = {
    messi: buildPlayerProfile('Lionel Messi', messiBreakdown, messiSeasons, {
      totalTrophies: totalTrophies?.messi || 0,
      ballonDor: ballonDor?.messi || 0,
      fifaBest: fifaBest?.messi || 0,
      goldenShoe: goldenShoe?.messi || 0,
    }),
    ronaldo: buildPlayerProfile('Cristiano Ronaldo', ronaldoBreakdown, ronaldoSeasons, {
      totalTrophies: totalTrophies?.ronaldo || 0,
      ballonDor: ballonDor?.ronaldo || 0,
      fifaBest: fifaBest?.ronaldo || 0,
      goldenShoe: goldenShoe?.ronaldo || 0,
    }),
  };

  const dataset = {
    source: 'https://www.messivsronaldo.app/',
    fetchedAt: new Date().toISOString(),
    players,
    honours: {
      majorTeam: filterHonoursBy(honoursEdges, (node) => node.awardType === 'team' && node.type === 'major'),
      majorIndividual: filterHonoursBy(honoursEdges, (node) => node.awardType === 'individual' && node.type === 'major'),
      otherHighlights: filterHonoursBy(honoursEdges, (node) => node.type === 'other'),
    },
  };

  await writeFile(OUTPUT_PATH, JSON.stringify(dataset, null, 2));
  console.log(`Data written to ${OUTPUT_PATH}`);
};

main().catch((error) => {
  console.error('Failed to build dataset:', error);
  process.exitCode = 1;
});
