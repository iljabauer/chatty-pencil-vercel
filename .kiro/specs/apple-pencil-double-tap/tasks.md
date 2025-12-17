# Implementation Plan

- [x] 1. Create PencilInteractionManager and integrate with CanvasPlugin
  - [x] 1.1 Create PencilInteractionManager.swift file
    - Create new Swift file in `capacitor-canvas-plugin/ios/Sources/CanvasPlugin/`
    - Implement singleton pattern with `static let shared`
    - Define `PencilInteractionManagerDelegate` protocol with `pencilInteractionDidRequestToggle()` method
    - Implement `UIPencilInteractionDelegate` conformance
    - Add `setupInteraction(on view: UIView)` method to register interaction
    - Implement `pencilInteractionDidTap(_ interaction:)` to call delegate
    - _Requirements: 1.3, 3.1, 3.2_

  - [x] 1.2 Add canvas state tracking to CanvasPlugin
    - Add `private var isCanvasOpen: Bool` property to track state
    - Update `openCanvas()` to set `isCanvasOpen = true`
    - Update delegate callbacks to set `isCanvasOpen = false` on minimize/submit/cancel
    - _Requirements: 1.1, 2.1_

  - [x] 1.3 Implement PencilInteractionManagerDelegate in CanvasPlugin
    - Conform `CanvasPlugin` to `PencilInteractionManagerDelegate`
    - Implement `pencilInteractionDidRequestToggle()` method
    - Only handle when canvas is closed (respect PKToolPicker when open)
    - _Requirements: 1.1, 2.1_

  - [x] 1.4 Setup pencil interaction on plugin load
    - Override `load()` method in CanvasPlugin
    - Get reference to bridge's webView
    - Call `PencilInteractionManager.shared.setupInteraction(on: webView)`
    - Set `PencilInteractionManager.shared.delegate = self`
    - _Requirements: 1.3, 3.1_

  - [ ]* 1.5 Write property test for canvas open callback
    - **Property 1: Double-tap opens canvas when closed**
    - **Validates: Requirements 1.1**

- [x] 2. Implement canvas open from pencil tap with state preservation
  - [x] 2.1 Create internal openCanvasFromPencilTap method
    - Create method that opens canvas without requiring a Capacitor call
    - Reuse existing canvas presentation logic
    - Store a pending result handler for when canvas closes
    - _Requirements: 1.1, 1.2_

  - [x] 2.2 Handle canvas result from pencil-initiated open
    - When canvas closes (submit/minimize), resolve any pending web layer notification
    - Ensure preserved strokes are restored when opening
    - _Requirements: 1.2, 2.2, 2.3_

  - [ ]* 2.3 Write property test for state preservation round-trip
    - **Property 2: State preservation round-trip**
    - **Validates: Requirements 1.2, 2.2**

- [x] 3. Ensure proper PKToolPicker behavior when canvas is open
  - [x] 3.1 Verify PKToolPicker handles pencil interactions
    - PKToolPicker automatically respects user's system pencil preferences
    - No additional UIPencilInteraction needed in CanvasViewController
    - _Requirements: 2.1, 3.2_

  - [x] 3.2 Ensure minimize method works correctly
    - Extract minimize logic from `minimizeTapped()` into reusable method
    - Call this method from button tap and swipe gestures
    - Ensure strokes are preserved before dismissing
    - _Requirements: 2.1, 2.2_

  - [ ]* 3.3 Write property test for minimize notification
    - **Property 3: Minimize notification includes content state**
    - **Validates: Requirements 2.3**

- [x] 4. Add graceful degradation for unsupported devices
  - [x] 4.1 Add availability checks
    - Wrap `UIPencilInteraction` usage in `@available` checks
    - Ensure app compiles and runs on older iOS versions
    - Log informational message when pencil interaction is unavailable
    - _Requirements: 4.1, 4.2_

- [x] 5. Human testing and verification (COMPLETED)
  - [x] 5.1 Human confirms: Double-tap opens canvas from chat view
    - Build and run app on iPad with Apple Pencil 2nd gen or Pro
    - From chat view, double-tap Apple Pencil
    - Verify canvas overlay opens
    - _Requirements: 1.1, 1.3, 3.1_

  - [x] 5.2 Human confirms: Strokes preserved on double-tap open
    - Open canvas via button, draw some strokes
    - Minimize canvas via button
    - Double-tap Apple Pencil to reopen
    - Verify previous strokes are restored
    - _Requirements: 1.2_

  - [x] 5.3 Human confirms: PKToolPicker respects system preferences
    - Open canvas (via button or double-tap)
    - Draw some strokes on canvas
    - Double-tap Apple Pencil while canvas is open
    - Verify system preference is respected (e.g., switch to eraser)
    - _Requirements: 2.1, 3.2_

  - [x] 5.4 Human confirms: App works without Apple Pencil support
    - Run app on iOS Simulator (no pencil support)
    - Verify app launches without errors
    - Verify canvas button still opens/closes canvas normally
    - _Requirements: 4.1, 4.2_

- [x] 6. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 7. Write unit tests for pencil interaction (OPTIONAL)
  - [ ]* 7.1 Test PencilInteractionManager setup
    - Verify interaction is added to view
    - Verify delegate is called on tap simulation
    - _Requirements: 1.3, 3.1_

  - [ ]* 7.2 Test CanvasPlugin state tracking
    - Verify isCanvasOpen is updated correctly
    - Verify open behavior when canvas is closed
    - _Requirements: 1.1_

  - [ ]* 7.3 Test graceful degradation
    - Verify no crashes when pencil interaction unavailable
    - Verify button toggle still works
    - _Requirements: 4.1, 4.2_
