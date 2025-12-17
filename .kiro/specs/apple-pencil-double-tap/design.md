# Design Document: Apple Pencil Double-Tap Canvas Toggle

## Overview

This feature adds Apple Pencil double-tap gesture support to toggle the canvas overlay open/closed. The implementation uses the native `UIPencilInteraction` API available on iPadOS 12.1+ for Apple Pencil (2nd generation) and Apple Pencil Pro devices.

The gesture provides a hardware shortcut that complements the existing on-screen toggle button, allowing users to quickly switch between drawing and viewing their chat without lifting their pencil to tap UI elements.

## Architecture

```mermaid
flowchart TB
    subgraph "Web Layer"
        A[Chat View] --> B[useCanvasPlugin Hook]
        B --> C[Canvas Plugin Bridge]
    end
    
    subgraph "Native iOS Layer"
        C --> D[CanvasPlugin]
        D --> E[CanvasViewController]
        D --> F[PencilInteractionManager]
        F --> G[UIPencilInteraction]
        G -->|double-tap| F
        F -->|toggle| D
    end
    
    E -->|minimize/submit| D
    D -->|result| C
```

The architecture introduces a new `PencilInteractionManager` class that:
1. Manages `UIPencilInteraction` registration on the main web view
2. Listens for double-tap gestures via `UIPencilInteractionDelegate`
3. Communicates with `CanvasPlugin` to trigger canvas open/minimize actions

## Components and Interfaces

### PencilInteractionManager (New)

A singleton class that manages Apple Pencil interaction across the app lifecycle.

```swift
protocol PencilInteractionManagerDelegate: AnyObject {
    func pencilInteractionDidRequestToggle()
}

class PencilInteractionManager: NSObject, UIPencilInteractionDelegate {
    static let shared = PencilInteractionManager()
    weak var delegate: PencilInteractionManagerDelegate?
    private var interaction: UIPencilInteraction?
    
    func setupInteraction(on view: UIView) {
        let pencilInteraction = UIPencilInteraction()
        pencilInteraction.delegate = self
        view.addInteraction(pencilInteraction)
        self.interaction = pencilInteraction
    }
    
    func pencilInteractionDidTap(_ interaction: UIPencilInteraction) {
        // Always toggle canvas regardless of preferredTapAction
        // since our toggle action is app-specific, not tool-switching
        delegate?.pencilInteractionDidRequestToggle()
    }
}
```

### CanvasPlugin (Modified)

The existing plugin is extended to:
1. Implement `PencilInteractionManagerDelegate`
2. Handle toggle requests from the pencil interaction
3. Track canvas open/closed state internally

```swift
extension CanvasPlugin: PencilInteractionManagerDelegate {
    func pencilInteractionDidRequestToggle() {
        if isCanvasOpen {
            minimizeCanvas()
        } else {
            openCanvasFromPencilTap()
        }
    }
}
```

### CanvasViewController (No Changes Required)

The canvas view controller uses PKToolPicker which automatically handles Apple Pencil interactions according to the user's system preferences. No additional pencil interaction setup is needed.

## Data Models

No new data models are required. The existing `CanvasResult` interface handles all communication:

```typescript
interface CanvasResult {
  action: 'submitted' | 'minimized' | 'cancelled';
  imageData?: string;
  hasContent: boolean;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Double-tap opens canvas when closed
*For any* closed canvas state, when a double-tap gesture is detected, the canvas SHALL open.
**Validates: Requirements 1.1**

### Property 2: State preservation round-trip
*For any* drawing on the canvas, minimizing via double-tap and then reopening via double-tap SHALL restore the exact same drawing strokes.
**Validates: Requirements 1.2, 2.2**

### Property 3: Minimize notification includes content state
*For any* minimize action (via button or swipe), the delegate callback SHALL be invoked with the correct `hasContent` boolean reflecting whether strokes exist on the canvas.
**Validates: Requirements 2.3**

## User Preference Handling

The system provides `UIPencilInteraction.preferredTapAction` which reflects the user's system-wide preference for what double-tap should do:
- `.switchEraser` - Switch to eraser tool
- `.switchPrevious` - Switch to previous tool
- `.showColorPalette` - Show color picker
- `.showInkAttributes` - Show ink settings
- `.ignore` - Do nothing

**Design Decision**: Due to iPadOS system behavior with PKToolPicker:
1. When canvas is closed: Handle double-tap to open canvas (app-specific action)
2. When canvas is open with PKToolPicker active: Defer to user's system-wide pencil preference (e.g., switch to eraser, show color palette)
3. This provides the best user experience by respecting system conventions while adding our custom shortcut

## Error Handling

| Scenario | Handling |
|----------|----------|
| Device doesn't support UIPencilInteraction | Gracefully skip interaction setup; app functions normally via button |
| Double-tap during canvas transition | Ignore gesture if canvas is animating open/close |
| Plugin not initialized | Log warning and ignore gesture |
| UIPencilInteraction API unavailable (older iOS) | Check availability before setup; fall back to button-only |

## Testing Strategy

### Unit Tests

- Verify `PencilInteractionManager` correctly registers interaction on view
- Verify delegate callback is invoked on simulated double-tap
- Verify `CanvasPlugin` correctly tracks open/closed state

### Property-Based Tests

Property-based tests will use XCTest with custom generators for canvas states and drawings.

**Property 1 Test**: Generate random sequences of double-tap events and verify each tap toggles the state correctly.

**Property 2 Test**: Generate random `PKDrawing` objects, perform minimize/reopen cycle via double-tap simulation, and verify drawing equality.

**Property 3 Test**: Generate random canvas states (empty/with-strokes), trigger minimize, and verify delegate receives correct `hasContent` value.

### Integration Tests

- End-to-end test: Open canvas via double-tap, draw, minimize via double-tap, verify strokes preserved
- Fallback test: Verify button toggle still works when pencil interaction is unavailable
