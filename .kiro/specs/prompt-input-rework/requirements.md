# Requirements Document

## Introduction

This feature reworks the PromptInput area to provide a cleaner, more minimal input bar design inspired by modern chat interfaces. The new layout positions the input mode toggle button on the left, the main input area (canvas button or text input) in the center, and the send/stop button on the right. This creates a more intuitive and visually balanced input experience that aligns with contemporary mobile chat UI patterns.

## Glossary

- **PromptInput**: The main input component at the bottom of the chat interface where users compose messages
- **Input Mode Toggle**: A button that switches between canvas input mode and keyboard/text input mode
- **Canvas Button**: A button that opens the native fullscreen canvas for handwriting input
- **Text Input**: A standard text field for typing messages
- **Send Button**: A button that submits the current message or stops streaming responses
- **Input Bar**: The horizontal container holding all input-related controls

## Requirements

### Requirement 1

**User Story:** As a user, I want a clean, minimal input bar layout, so that I can easily access all input controls without visual clutter.

#### Acceptance Criteria

1. WHEN the input bar is displayed THEN the System SHALL render a horizontal layout with three distinct sections: left controls, center input area, and right controls
2. WHEN the input bar is displayed THEN the System SHALL position the input mode toggle button on the left side
3. WHEN the input bar is displayed THEN the System SHALL position the main input area (canvas button or text field) in the center, taking up the available space
4. WHEN the input bar is displayed THEN the System SHALL position the send/stop button on the right side
5. WHEN the input bar is displayed THEN the System SHALL use a rounded pill-shaped container with subtle border styling

### Requirement 2

**User Story:** As a user, I want to toggle between canvas and keyboard input modes, so that I can choose my preferred input method.

#### Acceptance Criteria

1. WHEN the user taps the input mode toggle button THEN the System SHALL switch between canvas mode and keyboard mode
2. WHEN in canvas mode THEN the System SHALL display a "+" icon on the toggle button
3. WHEN in keyboard mode THEN the System SHALL display a pencil/pen icon on the toggle button to indicate canvas mode is available
4. WHEN switching input modes THEN the System SHALL preserve any unsaved canvas content

### Requirement 3

**User Story:** As a user, I want the center input area to adapt based on the current input mode, so that I see the appropriate input control.

#### Acceptance Criteria

1. WHEN in canvas mode THEN the System SHALL display a tappable area with placeholder text (e.g., "Tap to write") in the center
2. WHEN in keyboard mode THEN the System SHALL display a text input field in the center
3. WHEN the canvas has unsaved content THEN the System SHALL indicate this visually in the center area
4. WHEN the user taps the center area in canvas mode THEN the System SHALL open the native canvas overlay

### Requirement 4

**User Story:** As a user, I want the send button to reflect the current state, so that I know what action will occur when I tap it.

#### Acceptance Criteria

1. WHEN there is content to send (text or canvas drawing) THEN the System SHALL display an enabled send button
2. WHEN there is no content to send THEN the System SHALL display a disabled or alternative state for the send button
3. WHEN a response is streaming THEN the System SHALL display a stop button instead of the send button
4. WHEN the user taps the send button with content THEN the System SHALL submit the message
5. WHEN the user taps the stop button during streaming THEN the System SHALL stop the response generation

### Requirement 5

**User Story:** As a user, I want the input bar to have a modern, rounded appearance, so that it feels contemporary and touch-friendly.

#### Acceptance Criteria

1. WHEN the input bar is rendered THEN the System SHALL apply rounded corners (pill shape) to the container
2. WHEN the input bar is rendered THEN the System SHALL use a light background with subtle border
3. WHEN the input bar is rendered THEN the System SHALL ensure adequate touch target sizes for all interactive elements (minimum 44x44 points)
4. WHEN the input bar is rendered THEN the System SHALL maintain consistent spacing between elements

