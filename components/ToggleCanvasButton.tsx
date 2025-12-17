'use client';

import React from 'react';
import { PenToolIcon } from 'lucide-react';
import { PromptInputButton } from '@/components/ai-elements/prompt-input';
import { cn } from '@/lib/utils';

export interface ToggleCanvasButtonProps {
  /**
   * Callback when button is clicked to open canvas
   */
  onClick: () => void;
  
  /**
   * Whether there's unsaved content on the canvas
   * Shows an indicator dot when true
   */
  hasUnsavedContent: boolean;
  
  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
  
  /**
   * Additional CSS classes
   */
  className?: string;
  
  /**
   * Button style variant - matches PromptInputButton variants
   */
  variant?: 'default' | 'ghost';
}

/**
 * Toggle Canvas Button Component
 * 
 * Displays a pencil/canvas icon button that opens the native canvas when clicked.
 * Shows a visual indicator when there's unsaved content on the canvas.
 * Uses PromptInputButton to match the styling of other prompt input tools.
 * 
 * Requirements:
 * - Display pencil/canvas icon button
 * - Show indicator when unsaved content exists  
 * - Call openCanvas() on click
 */
export function ToggleCanvasButton({
  onClick,
  hasUnsavedContent,
  disabled = false,
  className,
  variant = 'ghost',
}: ToggleCanvasButtonProps) {
  return (
    <div className="relative">
      <PromptInputButton
        onClick={onClick}
        disabled={disabled}
        variant={hasUnsavedContent ? 'default' : variant}
        className={className}
        aria-label={hasUnsavedContent ? 'Open canvas (unsaved content)' : 'Open canvas'}
      >
        <PenToolIcon size={16} />
        <span>Canvas</span>
      </PromptInputButton>
      
      {/* Unsaved content indicator - only show if variant is ghost to avoid double indication */}
      {hasUnsavedContent && variant === 'ghost' && (
        <div 
          className={cn(
            'absolute -top-1 -right-1 size-3 bg-blue-500 rounded-full border-2 border-white',
            'animate-pulse'
          )}
          aria-hidden="true"
        />
      )}
    </div>
  );
}