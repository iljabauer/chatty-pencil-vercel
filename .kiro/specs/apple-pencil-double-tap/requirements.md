# Requirements Document

## Introduction

This feature adds Apple Pencil double-tap gesture support to the Chatty Pencil app. Users with Apple Pencil (2nd generation) or Apple Pencil Pro can double-tap their pencil to toggle the canvas overlay open or closed, providing a faster and more natural shortcut compared to tapping the on-screen button. This leverages the native `UIPencilInteraction` API available on iPadOS.

## Glossary

- **Apple Pencil Double-Tap**: A hardware gesture available on Apple Pencil (2nd generation) and Apple Pencil Pro where the user taps twice on the flat side of the pencil
- **UIPencilInteraction**: The iOS/iPadOS API that allows apps to respond to Apple Pencil gestures like double-tap and squeeze
- **Canvas Overlay**: The fullscreen drawing surface that appears over the chat view
- **Toggle Action**: Opening the canvas when closed, or minimizing the canvas when open

## Requirements

### Requirement 1

**User Story:** As a user with Apple Pencil (2nd generation or Pro), I want to double-tap my pencil to open the canvas, so that I can start drawing without tapping the on-screen button.

#### Acceptance Criteria

1. WHEN the canvas overlay is closed and a user double-taps the Apple Pencil THEN the System SHALL open the fullscreen canvas overlay
2. WHEN the canvas opens via double-tap THEN the System SHALL restore any previously preserved strokes
3. WHEN the app launches THEN the System SHALL register for Apple Pencil double-tap interactions

### Requirement 2

**User Story:** As a user with Apple Pencil (2nd generation or Pro), I want to double-tap my pencil to minimize the canvas, so that I can quickly return to the chat view while preserving my drawing.

#### Acceptance Criteria

1. WHEN the canvas overlay is open and a user double-taps the Apple Pencil THEN the System SHALL minimize the canvas and return to the chat view
2. WHEN the canvas is minimized via double-tap THEN the System SHALL preserve all current strokes on the canvas
3. WHEN the canvas is minimized via double-tap THEN the System SHALL notify the web layer of the minimize action with content state

### Requirement 3

**User Story:** As a user, I want the double-tap gesture to work consistently regardless of where I am in the app, so that I have a reliable shortcut.

#### Acceptance Criteria

1. WHEN the user is on the main chat view THEN the System SHALL respond to Apple Pencil double-tap gestures
2. WHEN the canvas overlay is displayed THEN the System SHALL respond to Apple Pencil double-tap gestures
3. WHEN the double-tap gesture is detected THEN the System SHALL execute the toggle action within 100 milliseconds

### Requirement 4

**User Story:** As a user with Apple Pencil (1st generation), I want the app to function normally without double-tap support, so that I can still use the canvas via the on-screen button.

#### Acceptance Criteria

1. WHEN the device does not support UIPencilInteraction THEN the System SHALL continue to function without errors
2. WHEN Apple Pencil double-tap is unavailable THEN the System SHALL rely on the existing on-screen toggle button for canvas access
