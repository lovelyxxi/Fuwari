export type WindowKind = 'main' | 'floating';

export interface Api {
  getWindowKind: () => WindowKind;
  win: {
    minimize: () => void;
    maximize: () => void;
    close: () => void;
  };
  floating: {
    startDrag: (offsetX: number, offsetY: number) => void;
    stopDrag: () => void;
    openMain: () => void;
  };
}
