# Requirements Document

## Introduction

Chatty Pencil is a handwriting-first, general-purpose ChatGPT experience for iPad. This feature transforms the existing chat interface to support Apple Pencil input as the primary interaction method. Users write or draw on a canvas, submit their handwritten content as chat messages, and receive AI responses in a familiar streaming text format. The goal is to keep users in their creative flow without switching to a keyboard—ideal for diagrams, visual thinking, and natural note-taking.

## Glossary

- **Canvas**: A drawable surface where users create handwritten input using Apple Pencil or touch
- **Stroke**: A single continuous line drawn on the canvas from pen-down to pen-up
- **Canvas Submission**: The act of sending the current canvas content as a chat message to the AI
- **Canvas Image**: A PNG or JPEG representation of the canvas content sent to the AI for processing
- **Clear Canvas**: Removing all strokes from the canvas to start fresh
- **Chat Message**: A single exchange unit in the conversation, either from the user (canvas image) or AI (text response)
- **Streaming Response**: AI text that appears incrementally as it's generated

## Requirements

### Requirement 1

**User Story:** As a user, I want to draw and write on a fullscreen canvas with Apple Pencil, so that I can express my thoughts naturally without typing.

#### Acceptance Criteria

1. WHEN the fullscreen canvas overlay is open and a user touches the canvas with Apple Pencil THEN the Canvas SHALL capture and render strokes in real-time with minimal latency
2. WHEN a user draws on the fullscreen canvas THEN the Canvas SHALL render strokes with smooth anti-aliased lines
3. WHEN a user lifts the Apple Pencil THEN the Canvas SHALL complete the current stroke and prepare for the next input
4. WHEN the canvas contains strokes THEN the Canvas SHALL maintain stroke data until explicitly cleared or submitted

### Requirement 2

**User Story:** As a user, I want to submit my canvas drawing as a chat message, so that the AI can see and respond to my handwritten content.

#### Acceptance Criteria

1. WHEN a user taps the submit button with content on the canvas THEN the System SHALL convert the canvas to an image and send it as a chat message
2. WHEN a user submits the canvas THEN the System SHALL clear the canvas after successful submission
3. WHEN a user attempts to submit an empty canvas THEN the System SHALL prevent submission and maintain the current state
4. WHEN the canvas is submitted THEN the System SHALL display the submitted image in the chat conversation as a user message
5. WHEN the canvas image is sent THEN the System SHALL transmit the image to the AI provider for vision-based processing

### Requirement 3

**User Story:** As a user, I want to clear my canvas, so that I can start fresh if I make a mistake or change my mind.

#### Acceptance Criteria

1. WHEN a user taps the clear button THEN the Canvas SHALL remove all strokes and reset to a blank state
2. WHEN the canvas is empty THEN the Clear button SHALL remain accessible but indicate the canvas is already clear
3. WHEN a user clears the canvas THEN the System SHALL complete the operation within 100 milliseconds

### Requirement 4

**User Story:** As a user, I want to see AI responses as streaming text in a chat interface, so that I can read the response as it's generated.

#### Acceptance Criteria

1. WHEN the AI begins responding THEN the System SHALL display text incrementally as it streams from the provider
2. WHEN a response is streaming THEN the System SHALL show a visual indicator that the response is in progress
3. WHEN the AI completes its response THEN the System SHALL remove the streaming indicator and finalize the message
4. WHEN displaying AI responses THEN the System SHALL render markdown formatting appropriately

### Requirement 5

**User Story:** As a user, I want to scroll through my conversation history, so that I can review previous exchanges.

#### Acceptance Criteria

1. WHEN the conversation contains multiple messages THEN the System SHALL enable vertical scrolling through the history
2. WHEN a new message is added THEN the System SHALL auto-scroll to show the latest message
3. WHEN a user manually scrolls up THEN the System SHALL pause auto-scroll until the user scrolls back to the bottom
4. WHEN displaying user messages THEN the System SHALL show the submitted canvas images as thumbnails that can be expanded

### Requirement 6

**User Story:** As a user, I want to toggle a fullscreen canvas overlay from the chat view, so that I can focus on drawing while still having access to my chat history.

#### Acceptance Criteria

1. WHEN a user is in the chat view THEN the System SHALL display a prominent "Open Canvas" button as the primary and default input method at the bottom of the screen
2. WHEN a user taps the "Open Canvas" button THEN the System SHALL open a fullscreen canvas overlay covering the chat view
3. WHEN the fullscreen canvas overlay is open THEN the System SHALL be the only place where drawing input is accepted
4. WHEN the canvas overlay is open THEN the System SHALL display a minimize button to return to chat view
5. WHEN a user minimizes the canvas without submitting THEN the System SHALL preserve all strokes on the canvas
6. WHEN a user reopens the canvas after minimizing THEN the System SHALL restore the previously drawn strokes
7. WHEN the canvas is submitted THEN the System SHALL close the canvas overlay and return to chat view
8. WHEN a user taps the "Open Keyboard" button THEN the System SHALL replace the canvas button with a text input field
9. WHEN the text input mode is active THEN the System SHALL display a button to return to canvas input mode
10. WHEN switching between input modes THEN the System SHALL preserve any unsaved canvas content
11. WHEN in canvas input mode THEN the System SHALL display the input footer (images, websearch, model switching) below the canvas button

### Requirement 7

**User Story:** As a user, I want to start a new conversation, so that I can begin fresh without previous context.

#### Acceptance Criteria

1. WHEN a user taps the new conversation button THEN the System SHALL clear the current conversation and start fresh
2. WHEN starting a new conversation THEN the System SHALL clear the canvas
