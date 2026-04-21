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
} as const;

export type Channel = typeof CH[keyof typeof CH];
