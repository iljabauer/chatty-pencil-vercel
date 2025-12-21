# Requirements Document

## Introduction

This feature optimizes the canvas image export process to minimize AI API token costs while maintaining content quality. By calculating a tight bounding box around the actual drawn content and intelligently scaling the image, we can significantly reduce the number of tokens consumed per canvas submission. This is especially important given that vision models charge based on image dimensions using a 32x32 pixel patch system, and most canvas space is typically empty.

## Glossary

- **Bounding Box**: The minimal rectangle that contains all drawn strokes on the canvas
- **Patch**: A 32x32 pixel unit used by AI vision models to calculate token costs
- **Token Budget**: The maximum number of patches (1536) before image scaling is required
- **Content Padding**: Additional pixels added around the bounding box for visual breathing room
- **Image Scaling**: Reducing image dimensions while preserving aspect ratio to fit within token budget

## Requirements

### Requirement 1

**User Story:** As a developer, I want the canvas export to calculate a tight bounding box around drawn content, so that empty canvas space doesn't consume unnecessary tokens.

#### Acceptance Criteria

1. WHEN the canvas contains strokes THEN the System SHALL calculate the minimum bounding rectangle that contains all stroke points
2. WHEN calculating the bounding box THEN the System SHALL iterate through all strokes in the PKDrawing to find minimum and maximum x and y coordinates
3. WHEN the bounding box is calculated THEN the System SHALL add 32 pixels of padding on all sides of the content bounds
4. WHEN the padded bounding box extends beyond canvas boundaries THEN the System SHALL clip the bounds to the canvas dimensions
5. WHEN the canvas contains no strokes THEN the System SHALL return an empty bounding box

### Requirement 2

**User Story:** As a developer, I want the exported image to be cropped to the bounding box, so that only relevant content is sent to the AI.

#### Acceptance Criteria

1. WHEN exporting the canvas image THEN the System SHALL render only the region defined by the padded bounding box
2. WHEN rendering the cropped region THEN the System SHALL maintain the original drawing quality and resolution
3. WHEN the bounding box is empty THEN the System SHALL prevent image export and return an error
4. WHEN the cropped image is created THEN the System SHALL use PNG format with transparency support

### Requirement 3

**User Story:** As a developer, I want images to be constrained to reasonable dimensions, so that API costs remain predictable and processing is efficient.

#### Acceptance Criteria

1. WHEN the cropped image dimensions exceed 3200 pixels in width or height THEN the System SHALL scale down the image to fit within 3200x3200 while preserving aspect ratio
2. WHEN scaling to fit the maximum dimensions THEN the System SHALL calculate the scaling factor as: min(3200/width, 3200/height)
3. WHEN the cropped image dimensions are calculated THEN the System SHALL compute the number of 32x32 patches required using the formula: ceil(width/32) × ceil(height/32)
4. WHEN the patch count exceeds 1536 THEN the System SHALL calculate an additional scaling factor using: sqrt(1536 × 32² / (width × height))
5. WHEN applying the scaling factor THEN the System SHALL adjust the factor to ensure dimensions align to whole patch boundaries
6. WHEN scaling the image THEN the System SHALL preserve the aspect ratio exactly
7. WHEN the image dimensions are within limits THEN the System SHALL export the image without scaling

### Requirement 4

**User Story:** As a developer, I want to log dimension information for each export, so that I can monitor image optimization effectiveness.

#### Acceptance Criteria

1. WHEN an image is exported THEN the System SHALL log the original canvas dimensions before cropping
2. WHEN the bounding box is calculated THEN the System SHALL log the cropped dimensions after applying the bounding box
3. WHEN scaling is applied THEN the System SHALL log the final exported image dimensions
4. WHEN logging is enabled THEN the System SHALL output this information to the console in a structured format for debugging

### Requirement 5

**User Story:** As a developer, I want the optimization to work seamlessly with the existing canvas plugin, so that no changes are required to the JavaScript layer.

#### Acceptance Criteria

1. WHEN the optimization is implemented THEN the System SHALL maintain the existing CanvasPlugin interface without breaking changes
2. WHEN openCanvas() is called THEN the System SHALL return the same CanvasResult structure with optimized imageData
3. WHEN the optimized image is returned THEN the System SHALL still be a valid base64-encoded PNG string
4. WHEN the web layer receives the image THEN the System SHALL display and transmit it exactly as before
