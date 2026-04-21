export const CH = {
  PREFS_GET: 'prefs:get',
  PREFS_SET: 'prefs:set',
  PREFS_CHANGED: 'prefs:changed',
} as const;

export type Channel = typeof CH[keyof typeof CH];
