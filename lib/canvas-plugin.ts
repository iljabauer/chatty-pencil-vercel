import { registerPlugin } from '@capacitor/core';

/**
 * Options for opening the canvas
 */
export interface OpenCanvasOptions {
  /** Background color for the canvas (default: white) */
  backgroundColor?: string;
}

/**
 * Result returned from canvas operations
 */
export interface CanvasResult {
  /** Action taken by user */
  action: 'submitted' | 'minimized' | 'cancelled';
  /** Base64 PNG image data (only present if action is 'submitted') */
  imageData?: string;
  /** Whether canvas has content (for minimize case) */
  hasContent: boolean;
}

/**
 * Response from hasContent method
 */
export interface HasContentResult {
  hasContent: boolean;
}

/**
 * Canvas plugin interface for handwriting input
 */
export interface CanvasPlugin {
  /**
   * Opens the native fullscreen canvas for drawing.
   * Returns when user submits (with image) or minimizes (without image).
   */
  openCanvas(options?: OpenCanvasOptions): Promise<CanvasResult>;
  
  /**
   * Clears the preserved canvas state (called on new conversation).
   */
  clearCanvas(): Promise<void>;
  
  /**
   * Checks if there's unsaved content on the canvas.
   */
  hasContent(): Promise<HasContentResult>;
}

// Register the plugin with Capacitor
export const Canvas = registerPlugin<CanvasPlugin>('Canvas');