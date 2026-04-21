export type WindowKind = 'main' | 'floating';

export interface Api {
  getWindowKind: () => WindowKind;
  win: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
}
