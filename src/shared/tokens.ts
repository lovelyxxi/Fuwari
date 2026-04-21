export type Mood = 'happy' | 'calm' | 'sleepy' | 'worried' | 'alert';

export type Category = '工作' | '沟通' | '浏览' | '娱乐' | '其他';

export const CATEGORY_COLORS: Record<Category, string> = {
  工作: 'var(--mint)',
  沟通: 'var(--blue)',
  浏览: 'var(--lilac)',
  娱乐: 'var(--peach)',
  其他: 'var(--lemon)',
};

export type FloatingVariant = 'A' | 'B' | 'C';
export type MascotKind = 'cloud' | 'jelly';
export type Theme = 'light' | 'dark';

export const HOURS_PER_DAY = 24;
