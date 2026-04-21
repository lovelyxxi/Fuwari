export type WindowKind = 'main' | 'floating';

export interface Api {
  getWindowKind: () => WindowKind;
}
