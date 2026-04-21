import { powerMonitor } from 'electron';
import { EventEmitter } from 'node:events';

const IDLE_THRESHOLD_SECS = 5 * 60;

export class IdleMonitor extends EventEmitter {
  private timer: NodeJS.Timeout | null = null;
  private idle = false;

  start() {
    if (this.timer) return;
    this.timer = setInterval(() => {
      const idleSecs = powerMonitor.getSystemIdleTime();
      const nowIdle = idleSecs >= IDLE_THRESHOLD_SECS;
      if (nowIdle !== this.idle) {
        this.idle = nowIdle;
        this.emit(nowIdle ? 'idle' : 'active');
      }
    }, 10_000);
  }

  stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
  isIdle() { return this.idle; }
}
