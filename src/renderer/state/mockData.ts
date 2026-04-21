import type { Category } from '@shared/tokens';
import type { AppIconKind } from '../components/primitives/AppIcon';

export interface AppUsage {
  name: string;
  kind: AppIconKind;
  mins: number;
  cat: Category;
  color: string;
}

export const TODAY_APPS: AppUsage[] = [
  { name: 'VS Code', kind: 'code',   mins: 183, cat: '工作', color: 'var(--mint)' },
  { name: '飞书',    kind: 'chat',   mins: 96,  cat: '沟通', color: 'var(--blue)' },
  { name: 'Figma',   kind: 'design', mins: 74,  cat: '工作', color: 'var(--lilac)' },
  { name: 'Chrome',  kind: 'browse', mins: 58,  cat: '浏览', color: 'var(--blue)' },
  { name: 'Notion',  kind: 'doc',    mins: 41,  cat: '工作', color: 'var(--lemon)' },
  { name: 'Spotify', kind: 'music',  mins: 32,  cat: '娱乐', color: 'var(--mint)' },
  { name: 'YouTube', kind: 'video',  mins: 24,  cat: '娱乐', color: 'var(--peach)' },
  { name: '微信',    kind: 'mail',   mins: 18,  cat: '沟通', color: 'var(--lilac)' },
];

export interface CategorySlice { name: Category; mins: number; color: string; }

export const CATEGORIES: CategorySlice[] = [
  { name: '工作', mins: 298, color: 'var(--mint)' },
  { name: '沟通', mins: 114, color: 'var(--blue)' },
  { name: '浏览', mins: 58,  color: 'var(--lilac)' },
  { name: '娱乐', mins: 56,  color: 'var(--peach)' },
];

export const HOURLY: number[] = [
  0, 0, 0, 0, 0, 0, 0, 5,
  42, 55, 58, 48, 25, 50, 58, 56,
  55, 52, 30, 15, 20, 30, 10, 2,
];

export interface DayUsage { d: string; mins: number; }

export const WEEKLY: DayUsage[] = [
  { d: '一', mins: 380 },
  { d: '二', mins: 456 },
  { d: '三', mins: 412 },
  { d: '四', mins: 528 },
  { d: '五', mins: 495 },
  { d: '六', mins: 180 },
  { d: '日', mins: 245 },
];
