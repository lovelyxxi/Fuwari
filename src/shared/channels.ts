export const CH = {
  PREFS_GET: 'prefs:get',
  PREFS_SET: 'prefs:set',
  PREFS_CHANGED: 'prefs:changed',
  TODAY_GET: 'today:get',
  HISTORY_GET_WEEK: 'history:get-week',
  CURRENT_APP: 'current-app',
  TICK: 'tick',
  EVENTS_CLEAR: 'events:clear',
  EVENTS_EXPORT: 'events:export',
  FOCUS_GET: 'focus:get',
  FOCUS_START: 'focus:start',
  FOCUS_PAUSE: 'focus:pause',
  FOCUS_RESET: 'focus:reset',
  FOCUS_SET_TASK: 'focus:set-task',
  FOCUS_UPDATE: 'focus:update',
} as const;

export type Channel = typeof CH[keyof typeof CH];
