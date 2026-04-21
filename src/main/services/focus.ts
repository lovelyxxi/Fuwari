import { EventEmitter } from 'node:events';
import type { FocusState } from '../../shared/types';

const DEFAULT_DURATION_SECS = 25 * 60;

export class Focus extends EventEmitter {
  private state: FocusState = {
    running: false,
    remainingSecs: DEFAULT_DURATION_SECS,
    durationSecs: DEFAULT_DURATION_SECS,
    task: '',
    completedToday: 0,
  };
  private timer: NodeJS.Timeout | null = null;

  start(minutes = 25) {
    this.clearTimer();
    this.state.durationSecs = minutes * 60;
    this.state.remainingSecs = minutes * 60;
    this.state.running = true;
    this.timer = setInterval(() => {
      this.state.remainingSecs = Math.max(0, this.state.remainingSecs - 1);
      if (this.state.remainingSecs === 0) this.complete();
      else this.emit('update', this.getState());
    }, 1000);
    this.emit('update', this.getState());
  }

  pause() {
    this.state.running = false;
    this.clearTimer();
    this.emit('update', this.getState());
  }

  reset() {
    this.pause();
    this.state.remainingSecs = this.state.durationSecs;
    this.emit('update', this.getState());
  }

  setTask(task: string) {
    this.state.task = task;
    this.emit('update', this.getState());
  }

  private complete() {
    this.clearTimer();
    this.state.running = false;
    this.state.completedToday += 1;
    this.emit('update', this.getState());
    this.emit('completed');
  }

  private clearTimer() {
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  }

  isRunning() { return this.state.running; }
  getState(): FocusState { return { ...this.state }; }
}
