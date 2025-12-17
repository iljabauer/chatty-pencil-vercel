import { useState, useCallback, useEffect } from 'react';
import { Canvas, type CanvasResult } from './canvas-plugin';

export interface UseCanvasPluginOptions {
  /**
   * Callback when canvas is submitted with image data
   */
  onSubmit?: (imageData: string) => void;
  
  /**
   * Callback when canvas is minimized (preserving content)
   */
  onMinimize?: (hasContent: boolean) => void;
  
  /**
   * Callback when canvas is cancelled
   */
  onCancel?: () => void;
}

export interface UseCanvasPluginReturn {
  /**
   * Opens the native canvas overlay
   */
  openCanvas: () => Promise<void>;
  
  /**
   * Clears the preserved canvas state
   */
  clearCanvas: () => Promise<void>;
  
  /**
   * Whether the canvas is currently open
   */
  isCanvasOpen: boolean;
  
  /**
   * Whether there's unsaved content on the canvas
   */
  hasUnsavedContent: boolean;
  
  /**
   * Refresh the unsaved content state
   */
  refreshContentState: () => Promise<void>;
}

/**
 * React hook for managing canvas plugin interactions
 * 
 * Wraps the native canvas plugin methods and provides state management
 * for canvas open/close state and unsaved content tracking.
 * 
 * @param options - Configuration options and callbacks
 * @returns Hook interface with canvas methods and state
 */
export function useCanvasPlugin(options: UseCanvasPluginOptions = {}): UseCanvasPluginReturn {
  const { onSubmit, onMinimize, onCancel } = options;
  
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [hasUnsavedContent, setHasUnsavedContent] = useState(false);

  /**
   * Check and update the unsaved content state
   */
  const refreshContentState = useCallback(async () => {
    try {
      const result = await Canvas.hasContent();
      setHasUnsavedContent(result.hasContent);
    } catch (error) {
      console.error('Failed to check canvas content:', error);
      // On error, assume no content to avoid blocking UI
      setHasUnsavedContent(false);
    }
  }, []);

  /**
   * Open the native canvas overlay
   */
  const openCanvas = useCallback(async () => {
    try {
      setIsCanvasOpen(true);
      
      const result: CanvasResult = await Canvas.openCanvas({
        backgroundColor: 'white'
      });

      // Handle the result based on user action
      switch (result.action) {
        case 'submitted':
          if (result.imageData) {
            onSubmit?.(result.imageData);
          }
          // Canvas is cleared after submission
          setHasUnsavedContent(false);
          break;
          
        case 'minimized':
          onMinimize?.(result.hasContent);
          setHasUnsavedContent(result.hasContent);
          break;
          
        case 'cancelled':
          onCancel?.();
          // Refresh content state in case user made changes before cancelling
          await refreshContentState();
          break;
      }
    } catch (error) {
      console.error('Failed to open canvas:', error);
      // On error, refresh content state to ensure UI is accurate
      await refreshContentState();
    } finally {
      setIsCanvasOpen(false);
    }
  }, [onSubmit, onMinimize, onCancel, refreshContentState]);

  /**
   * Clear the preserved canvas state
   */
  const clearCanvas = useCallback(async () => {
    try {
      await Canvas.clearCanvas();
      setHasUnsavedContent(false);
    } catch (error) {
      console.error('Failed to clear canvas:', error);
      // Still update state to reflect intended action
      setHasUnsavedContent(false);
    }
  }, []);

  // Check for unsaved content on mount
  useEffect(() => {
    refreshContentState();
  }, [refreshContentState]);

  return {
    openCanvas,
    clearCanvas,
    isCanvasOpen,
    hasUnsavedContent,
    refreshContentState,
  };
}