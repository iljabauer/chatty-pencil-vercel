import { registerPlugin } from '@capacitor/core';

import type { CanvasPlugin } from './definitions';

const Canvas = registerPlugin<CanvasPlugin>('Canvas', {
  web: () => import('./web').then((m) => new m.CanvasWeb()),
});

export * from './definitions';
export { Canvas };
