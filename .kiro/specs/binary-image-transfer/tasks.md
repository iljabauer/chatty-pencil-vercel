# Implementation Plan

- [ ] 1. Add binary utility functions to web layer
  - [ ] 1.1 Create binary-utils.ts with base64ToBlob function
    - Implement function to convert base64 data URL to Blob
    - Handle data URL prefix removal
    - Use atob() and Uint8Array for conversion
    - _Requirements: 2.1, 2.2_
  
  - [ ] 1.2 Add createMultipartFormData function
    - Create FormData with image Blob as file attachment
    - Add message data as JSON string in separate field
    - Return properly structured FormData
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 1.3 Write property test for round-trip data integrity
    - **Property 3: Round-trip data integrity**
    - **Validates: Requirements 6.1, 6.3**
  
  - [ ]* 1.4 Write property test for binary size reduction
    - **Property 2: Binary size reduction**
    - **Validates: Requirements 5.2**

- [ ] 2. Update API endpoint to accept multipart requests
  - [ ] 2.1 Add multipart parsing logic to route.ts
    - Check Content-Type header for multipart/form-data
    - Parse FormData using req.formData()
    - Extract image file and data JSON
    - _Requirements: 4.1, 4.2_
  
  - [ ] 2.2 Implement backward compatibility for JSON requests
    - Detect request type from Content-Type header
    - Handle JSON body parsing for legacy requests
    - Process both formats to same internal structure
    - _Requirements: 2.3_
  
  - [ ] 2.3 Add error handling for multipart parsing
    - Return 400 for missing data field
    - Return 400 for invalid JSON in data field
    - Log descriptive error messages
    - _Requirements: 4.4_
  
  - [ ] 2.4 Add transfer metrics logging
    - Log binary size when image received
    - Calculate theoretical base64 size
    - Log savings percentage
    - _Requirements: 5.1, 5.3_
  
  - [ ]* 2.5 Write property test for multipart request structure
    - **Property 4: Multipart request structure**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
  
  - [ ]* 2.6 Write property test for backward compatibility
    - **Property 5: Backward compatibility**
    - **Validates: Requirements 2.3**

- [ ] 3. Checkpoint - Ensure API accepts both formats
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Update canvas submission to use multipart
  - [ ] 4.1 Modify useCanvasPlugin onSubmit handler
    - Import binary utility functions
    - Convert base64 imageData to Blob
    - Create FormData with image and message data
    - _Requirements: 2.2, 3.1_
  
  - [ ] 4.2 Update sendMessage to support FormData
    - Modify transport to handle FormData body
    - Set appropriate Content-Type header (let browser set boundary)
    - Handle response parsing
    - _Requirements: 3.4_
  
  - [ ] 4.3 Add fallback to JSON on multipart failure
    - Catch errors during FormData construction
    - Fall back to original base64 JSON approach
    - Log warning when fallback is used
    - _Requirements: Error handling_
  
  - [ ]* 4.4 Write property test for Blob data type
    - **Property 6: Binary data type on web layer**
    - **Validates: Requirements 2.1, 2.2**

- [ ] 5. Update iOS native layer for metrics
  - [ ] 5.1 Add imageBinarySize to CanvasResult
    - Include binary size in plugin response
    - Update delegate method signature if needed
    - _Requirements: 1.4, 5.1_
  
  - [ ] 5.2 Add transfer metrics logging in Swift
    - Log binary size when image is generated
    - Calculate and log theoretical base64 size
    - Log savings percentage
    - _Requirements: 5.1, 5.3_
  
  - [ ]* 5.3 Write property test for PNG format preservation
    - **Property 1: PNG format preservation**
    - **Validates: Requirements 1.2, 6.2**

- [ ] 6. Update TypeScript definitions
  - [ ] 6.1 Add imageBinarySize to CanvasResult interface
    - Update definitions.ts with new optional field
    - Add JSDoc documentation
    - _Requirements: 1.4_
  
  - [ ] 6.2 Export binary utility types
    - Export TransferMetrics interface if needed
    - Ensure types are available for consumers
    - _Requirements: 2.1_

- [ ] 7. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 8. Integration tests
  - [ ]* 8.1 Test full flow with multipart request
    - Create test that submits canvas image
    - Verify multipart request is constructed correctly
    - Verify API receives and processes binary data
    - _Requirements: All requirements_
  
  - [ ]* 8.2 Test fallback to JSON request
    - Simulate multipart failure
    - Verify fallback to JSON works correctly
    - Verify backward compatibility maintained
    - _Requirements: 2.3, Error handling_
