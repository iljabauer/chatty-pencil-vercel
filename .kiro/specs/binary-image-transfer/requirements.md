# Requirements Document

## Introduction

This feature optimizes the canvas image transfer process by sending images as binary data instead of base64-encoded strings. Base64 encoding adds approximately 33% overhead to data size, meaning a 1MB image becomes ~1.33MB when base64 encoded. By transmitting raw binary PNG data, we can reduce bandwidth usage and improve transfer speeds, particularly important for mobile devices on cellular networks.

The optimization spans the entire data flow: from the native iOS canvas plugin through the Capacitor bridge to the Next.js API endpoint.

## Glossary

- **Base64 Encoding**: A binary-to-text encoding scheme that represents binary data as ASCII characters, adding ~33% size overhead
- **Binary Data**: Raw byte representation of data without text encoding overhead
- **Capacitor Bridge**: The communication layer between native iOS code and the web JavaScript layer
- **PNG Data**: Raw binary representation of a PNG image file
- **Blob**: A JavaScript object representing raw binary data
- **ArrayBuffer**: A JavaScript object representing a fixed-length raw binary data buffer
- **FormData**: A web API for constructing key/value pairs representing form fields and their values, including binary files
- **Multipart Request**: An HTTP request format that allows sending binary files alongside other form data

## Requirements

### Requirement 1

**User Story:** As a developer, I want the iOS canvas plugin to return raw PNG binary data, so that base64 encoding overhead is eliminated at the source.

#### Acceptance Criteria

1. WHEN the canvas is submitted THEN the CanvasPlugin SHALL return PNG data as raw bytes instead of a base64-encoded string
2. WHEN the PNG data is generated THEN the CanvasPlugin SHALL preserve the exact byte sequence of the PNG file format
3. WHEN returning binary data THEN the CanvasPlugin SHALL use Capacitor's native binary data transfer mechanism
4. WHEN the binary transfer is complete THEN the CanvasPlugin SHALL report the transfer size in bytes for monitoring

### Requirement 2

**User Story:** As a developer, I want the TypeScript plugin interface to handle binary image data, so that the web layer can process raw PNG bytes.

#### Acceptance Criteria

1. WHEN the plugin returns image data THEN the CanvasResult interface SHALL include a binary data type (Blob or ArrayBuffer)
2. WHEN binary data is received THEN the web layer SHALL convert the data to a Blob for further processing
3. WHEN the plugin interface changes THEN the System SHALL maintain backward compatibility by supporting both base64 and binary formats
4. WHEN binary data is available THEN the System SHALL prefer binary over base64 for new submissions

### Requirement 3

**User Story:** As a developer, I want to send the image as a multipart form request, so that binary data is transmitted efficiently to the API.

#### Acceptance Criteria

1. WHEN submitting a canvas image THEN the client SHALL construct a multipart/form-data request
2. WHEN building the multipart request THEN the client SHALL include the PNG binary as a file attachment
3. WHEN building the multipart request THEN the client SHALL include other message data as JSON in a separate part
4. WHEN the request is sent THEN the Content-Type header SHALL be multipart/form-data with appropriate boundary

### Requirement 4

**User Story:** As a developer, I want the API endpoint to accept multipart requests with binary images, so that the server can process raw PNG data directly.

#### Acceptance Criteria

1. WHEN receiving a multipart request THEN the API endpoint SHALL parse the binary image file from the form data
2. WHEN processing the image THEN the API endpoint SHALL read the raw PNG bytes without base64 decoding
3. WHEN forwarding to the AI provider THEN the API endpoint SHALL convert the binary to the format required by the provider (base64 if needed)
4. WHEN the multipart parsing fails THEN the API endpoint SHALL return a descriptive error response with status 400

### Requirement 5

**User Story:** As a developer, I want to verify that binary transfer reduces data size, so that I can confirm the bandwidth savings.

#### Acceptance Criteria

1. WHEN an image is transferred THEN the System SHALL log the binary size in bytes
2. WHEN comparing transfer methods THEN the binary transfer size SHALL be at least 25% smaller than the equivalent base64 transfer
3. WHEN logging transfer metrics THEN the System SHALL include both the raw size and the theoretical base64 size for comparison

### Requirement 6

**User Story:** As a developer, I want the binary transfer to be serializable and deserializable, so that data integrity is maintained across the transfer.

#### Acceptance Criteria

1. WHEN binary PNG data is serialized for transfer THEN deserializing the data SHALL produce identical bytes
2. WHEN the round-trip transfer completes THEN the PNG file SHALL be valid and renderable
3. WHEN verifying data integrity THEN the System SHALL compare byte lengths before and after transfer

</content>
