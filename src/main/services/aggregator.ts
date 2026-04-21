import type { EventRepository } from './repository';
import type { TodaySummary } from '../../shared/types';
import { HOURS_PER_DAY } from '../../shared/tokens';

const HOUR_MS = 3_600_000;
const MIN_MS = 60_000;

export function aggregateDay(repo: EventRepository, dayStartMs: number): TodaySummary {
  const dayEndMs = dayStartMs + HOURS_PER_DAY * HOUR_MS;
  const events = repo.findInRange(dayStartMs, dayEndMs);

  const hourly = new Array<number>(HOURS_PER_DAY).fill(0);
  const byApp = new Map<string, { appName: string; appExe: string; category: string; ms: number }>();
  const byCategory: Record<string, number> = {};

  for (const e of events) {
    const startMs = Math.max(e.startedAt, dayStartMs);
    const endMs = Math.min(e.endedAt, dayEndMs);
    if (endMs <= startMs) continue;
    const durMs = endMs - startMs;

    // split across hour buckets
    let cursor = startMs;
    while (cursor < endMs) {
      const hourIdx = Math.floor((cursor - dayStartMs) / HOUR_MS);
      const hourEnd = dayStartMs + (hourIdx + 1) * HOUR_MS;
      const chunkEnd = Math.min(hourEnd, endMs);
      hourly[hourIdx] += Math.round((chunkEnd - cursor) / MIN_MS);
      cursor = chunkEnd;
    }

    const key = e.appExe;
    const cur = byApp.get(key);
    if (cur) cur.ms += durMs;
    else byApp.set(key, { appName: e.appName, appExe: e.appExe, category: e.category, ms: durMs });

    byCategory[e.category] = (byCategory[e.category] ?? 0) + Math.round(durMs / MIN_MS);
  }

  const byAppArr = [...byApp.values()]
    .map((v) => ({ appName: v.appName, appExe: v.appExe, category: v.category, mins: Math.round(v.ms / MIN_MS) }))
    .sort((a, b) => b.mins - a.mins);

  const totalMins = byAppArr.reduce((s, a) => s + a.mins, 0);

  return { dateMs: dayStartMs, totalMins, byApp: byAppArr, byCategory, hourly };
}

export function startOfToday(now = Date.now()): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
