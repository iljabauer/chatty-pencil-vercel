import { WebPlugin } from '@capacitor/core';

import type { CanvasPlugin, OpenCanvasOptions, CanvasResult, HasContentResult } from './definitions';

export class CanvasWeb extends WebPlugin implements CanvasPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }

  async openCanvas(options?: OpenCanvasOptions): Promise<CanvasResult> {
    console.log('Web openCanvas called with options:', options);
    // For web testing, return a mock result
    return {
      action: 'cancelled',
      hasContent: false
    };
  }

  async clearCanvas(): Promise<void> {
    console.log('Web clearCanvas called');
    // No-op for web
  }

  async hasContent(): Promise<HasContentResult> {
    console.log('Web hasContent called');
    return { hasContent: false };
  }
}
