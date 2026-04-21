import path from 'node:path';
import { EventEmitter } from 'node:events';
import type { EventRepository } from './repository';
import { categorize } from './categorizer';
import type { CurrentAppInfo } from '../../shared/types';
import { getForegroundExe } from './foregroundWindow';

export class Tracker extends EventEmitter {
  private timer: NodeJS.Timeout | null = null;
  private current: { appExe: string; appName: string; category: string; startedAt: number } | null = null;
  private paused = false;

  constructor(private readonly repo: EventRepository) { super(); }

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => { void this.tick(); }, 1000);
  }

  stop() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
    this.flush();
  }

  pause() { this.paused = true; this.flush(); }
  resume() { this.paused = false; }

  private async tick() {
    if (this.paused) return;
    let info;
    try { info = getForegroundExe(); } catch (err) { console.error('[tracker] getForegroundExe:', err); return; }
    if (!info) return;

    const appExe = info.exePath;
    const appName = path.basename(appExe, path.extname(appExe));
    const category = categorize(appExe, appName);
    const now = Date.now();

    if (!this.current) {
      this.current = { appExe, appName, category, startedAt: now };
      this.emit('change', this.currentInfo());
      return;
    }
    if (this.current.appExe !== appExe) {
      this.repo.insert({
        appExe: this.current.appExe,
        appName: this.current.appName,
        startedAt: this.current.startedAt,
        endedAt: now,
        category: this.current.category,
      });
      this.current = { appExe, appName, category, startedAt: now };
      this.emit('change', this.currentInfo());
    } else {
      this.emit('tick', this.currentInfo());
    }
  }

  private flush() {
    if (!this.current) return;
    this.repo.insert({
      appExe: this.current.appExe,
      appName: this.current.appName,
      startedAt: this.current.startedAt,
      endedAt: Date.now(),
      category: this.current.category,
    });
    this.current = null;
  }

  currentInfo(): CurrentAppInfo | null {
    if (!this.current) return null;
    const now = Date.now();
    return {
      appExe: this.current.appExe,
      appName: this.current.appName,
      category: this.current.category,
      currentSessionMins: Math.round((now - this.current.startedAt) / 60_000),
      sessionStartedAt: this.current.startedAt,
    };
  }
}
