# Implementation Plan

- [x] 1. Implement bounding box calculation
  - [x] 1.1 Create BoundingBox struct in Canvas.swift
    - Define struct with minX, minY, maxX, maxY properties
    - Implement expand(to:) method to update bounds with new points
    - Implement rect computed property to convert to CGRect
    - _Requirements: 1.1, 1.5_
  
  - [x] 1.2 Implement calculateBoundingBox method in CanvasViewController
    - Iterate through all strokes in PKDrawing
    - Iterate through all points in each stroke path
    - Expand bounding box to include each point
    - Return empty rect for drawings with no strokes
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ]* 1.3 Write property test for bounding box contains all strokes
    - **Property 1: Bounding box contains all strokes**
    - **Validates: Requirements 1.1, 1.2**
  
  - [ ]* 1.4 Write edge case test for empty canvas bounding box
    - **Property 8: Empty canvas prevents export**
    - **Validates: Requirements 1.5, 2.3**

- [x] 2. Implement padding and clipping logic
  - [x] 2.1 Add padding to bounding box
    - Inset bounding box by -32 pixels on all sides
    - Handle edge case where padding creates negative dimensions
    - _Requirements: 1.3_
  
  - [x] 2.2 Clip padded box to canvas bounds
    - Intersect padded box with canvas bounds
    - Ensure result stays within valid canvas area
    - _Requirements: 1.4_
  
  - [ ]* 2.3 Write property test for padding application
    - **Property 2: Padding is applied correctly**
    - **Validates: Requirements 1.3**

- [x] 3. Implement scaling logic
  - [x] 3.1 Create ScalingResult struct
    - Define struct with original rect, scale factor, and final size
    - _Requirements: 3.1_
  
  - [x] 3.2 Implement scaleIfNeeded method
    - Check if width or height exceeds 3200 pixels
    - Calculate scale factor as min(3200/width, 3200/height)
    - Return ScalingResult with scale factor and final dimensions
    - Return scale of 1.0 if no scaling needed
    - _Requirements: 3.1, 3.2, 3.7_
  
  - [ ]* 3.3 Write property test for maximum dimension constraint
    - **Property 4: Dimensions respect maximum constraint**
    - **Validates: Requirements 3.1, 3.2**
  
  - [ ]* 3.4 Write property test for aspect ratio preservation
    - **Property 6: Scaling preserves aspect ratio**
    - **Validates: Requirements 3.6**
  
  - [ ]* 3.5 Write property test for no scaling when under limit
    - Test that images within 3200x3200 have scale factor of 1.0
    - _Requirements: 3.7_

- [x] 4. Implement logging
  - [x] 5.1 Create logExportDimensions method
    - Log original canvas dimensions
    - Log cropped dimensions after bounding box
    - Log final dimensions after scaling
    - Calculate and log percentage reduction
    - Format output in structured, readable format
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 4.2 Write property test for logging output
    - **Property 7: Logging outputs correct dimensions**
    - **Validates: Requirements 4.1, 4.2, 4.3**

- [ ] 5. Integrate optimization into submitTapped
  - [x] 5.1 Modify submitTapped to use bounding box
    - Call calculateBoundingBox for current drawing
    - Apply padding and clipping
    - Call scaleIfNeeded to get final dimensions
    - Export image using cropped region and scale factor
    - Call logExportDimensions with all dimension info
    - Maintain existing white background rendering
    - Maintain existing base64 encoding
    - _Requirements: 2.1, 2.4, 5.1, 5.2, 5.3_
  
  - [ ]* 5.2 Write property test for cropped image preserves content
    - **Property 3: Cropped image preserves content**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ]* 5.3 Write example test for PNG format
    - Verify exported image is PNG format
    - Verify base64 encoding is correct
    - _Requirements: 2.4, 5.3_

- [ ] 6. Add error handling
  - [ ] 6.1 Handle empty bounding box
    - Check if bounding box is empty before export
    - Return early without exporting if empty
    - Maintain existing empty canvas behavior
    - _Requirements: 2.3_
  
  - [ ] 6.2 Handle invalid dimensions
    - Check for zero or negative dimensions
    - Fall back to minimum size of 64x64 if needed
    - Log warning for invalid dimensions
    - _Requirements: Error handling_
  
  - [ ] 6.3 Handle rendering failures
    - Wrap image rendering in error handling
    - Fall back to full canvas export on failure
    - Log error details for debugging
    - _Requirements: Error handling_

- [ ]* 7. Write integration tests
  - [ ]* 7.1 Test full export flow with real PKDrawing
    - Create drawing with known strokes
    - Export and verify dimensions are reduced
    - Verify base64 string is valid
    - _Requirements: All requirements_
  
  - [ ]* 7.2 Test compatibility with existing interface
    - **Property 9: Interface compatibility**
    - Verify CanvasResult structure unchanged
    - Verify imageData format unchanged
    - **Validates: Requirements 5.1, 5.2, 5.3**

- [x] 8. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.
