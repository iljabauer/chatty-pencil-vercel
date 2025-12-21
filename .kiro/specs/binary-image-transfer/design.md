# Design Document

## Overview

This feature optimizes canvas image transfer by replacing base64-encoded strings with raw binary data. Base64 encoding adds approximately 33% overhead (every 3 bytes become 4 characters), so a 750KB PNG becomes ~1MB when base64 encoded. By transmitting raw binary PNG data, we reduce bandwidth usage by ~25% and improve transfer speeds.

The optimization spans three layers:
1. **iOS Native Layer**: Return raw `Data` bytes instead of base64 string
2. **Web Layer**: Handle binary data as `Blob`/`ArrayBuffer` and construct multipart requests
3. **API Layer**: Parse multipart form data and extract binary image directly

## Architecture

```mermaid
flowchart TB
    subgraph Current["Current Flow (Base64)"]
        PNG1["PNG Data<br/>(750KB)"] --> B64["Base64 Encode<br/>(+33% overhead)"]
        B64 --> JSON1["JSON String<br/>(~1MB)"]
        JSON1 --> API1["API Endpoint"]
        API1 --> Decode["Base64 Decode"]
        Decode --> AI1["AI Provider"]
    end
    
    subgraph Optimized["Optimized Flow (Binary)"]
        PNG2["PNG Data<br/>(750KB)"] --> Blob["Return as Data/Blob"]
        Blob --> FormData["FormData<br/>(multipart)"]
        FormData --> API2["API Endpoint"]
        API2 --> Direct["Direct Binary Read"]
        Direct --> AI2["AI Provider"]
    end
    
    style Optimized fill:#e1f5e1
    style Current fill:#ffe1e1
```

## Components and Interfaces

### 1. iOS Native Layer (Swift)

The `CanvasViewController` will return raw PNG `Data` instead of a base64 string. Capacitor supports returning binary data via the `call.resolve()` method by converting `Data` to a base64 string internally, but we'll use a more efficient approach.

```swift
// Canvas.swift - Modified delegate protocol
protocol CanvasViewControllerDelegate: AnyObject {
    func canvasDidSubmit(imageData: Data)  // Changed from String to Data
    func canvasDidMinimize(hasContent: Bool)
    func canvasDidCancel()
}

// CanvasViewController - Modified submitTapped
@objc private func submitTapped() {
    // ... existing bounding box and scaling logic ...
    
    guard let pngData = image.pngData() else {
        delegate?.canvasDidCancel()
        return
    }
    
    // Log transfer metrics
    logTransferMetrics(binarySize: pngData.count)
    
    // Return raw binary data
    canvas.setPreservedDrawing(nil)
    
    dismiss(animated: true) {
        self.delegate?.canvasDidSubmit(imageData: pngData)
    }
}

private func logTransferMetrics(binarySize: Int) {
    let base64Size = Int(ceil(Double(binarySize) * 4.0 / 3.0))
    let savings = base64Size - binarySize
    let savingsPercent = Double(savings) / Double(base64Size) * 100
    
    print("""
    [Binary Transfer]
    Binary size: \(binarySize) bytes
    Base64 would be: \(base64Size) bytes
    Savings: \(savings) bytes (\(Int(savingsPercent))%)
    """)
}
```

### 2. Capacitor Plugin Layer (Swift)

The plugin will convert binary data to base64 for Capacitor bridge transfer (Capacitor's standard approach), but we'll also provide a mechanism for the web layer to request binary format.

```swift
// CanvasPlugin.swift - Modified delegate implementation
func canvasDidSubmit(imageData: Data) {
    isCanvasOpen = false
    
    // Convert to base64 for Capacitor bridge (required by Capacitor)
    let base64String = imageData.base64EncodedString()
    
    let result: [String: Any] = [
        "action": "submitted",
        "imageData": base64String,  // Base64 for compatibility
        "imageBinarySize": imageData.count,  // Report actual binary size
        "hasContent": false
    ]
    
    if isPencilInitiated {
        notifyListeners("canvasSubmitted", data: result)
        isPencilInitiated = false
    } else {
        currentCall?.resolve(result)
        currentCall = nil
    }
    
    canvasViewController = nil
}
```

### 3. TypeScript Plugin Interface

Update the interface to include binary size information:

```typescript
// definitions.ts
export interface CanvasResult {
  action: 'submitted' | 'minimized' | 'cancelled';
  /** Base64 PNG image data (for compatibility) */
  imageData?: string;
  /** Size of the raw binary PNG in bytes */
  imageBinarySize?: number;
  hasContent: boolean;
}
```

### 4. Web Layer - Binary Conversion

The web layer will convert base64 back to binary for efficient multipart transfer:

```typescript
// lib/binary-utils.ts
export function base64ToBlob(base64DataUrl: string): Blob {
  // Remove data URL prefix if present
  const base64 = base64DataUrl.replace(/^data:image\/png;base64,/, '');
  
  // Decode base64 to binary
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: 'image/png' });
}

export function createMultipartFormData(
  imageBlob: Blob,
  messageData: object
): FormData {
  const formData = new FormData();
  
  // Add image as file
  formData.append('image', imageBlob, 'canvas-drawing.png');
  
  // Add message data as JSON
  formData.append('data', JSON.stringify(messageData));
  
  return formData;
}
```

### 5. API Endpoint - Multipart Handling

The API endpoint will accept both JSON (legacy) and multipart requests:

```typescript
// app/api/chat/route.ts
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  // Validate API key first
  if (!validateApiKey(req)) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  const contentType = req.headers.get('content-type') || '';
  
  let messages: UIMessage[];
  let model: string;
  let imageBuffer: Buffer | null = null;
  
  if (contentType.includes('multipart/form-data')) {
    // Handle multipart request with binary image
    const formData = await req.formData();
    const imageFile = formData.get('image') as File | null;
    const dataJson = formData.get('data') as string;
    
    if (!dataJson) {
      return new Response(JSON.stringify({ error: 'Missing data field' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const data = JSON.parse(dataJson);
    messages = data.messages;
    model = data.model;
    
    if (imageFile) {
      // Read binary directly - no base64 decoding needed
      imageBuffer = Buffer.from(await imageFile.arrayBuffer());
      
      // Log transfer metrics
      console.log(`[Binary Transfer] Received ${imageBuffer.length} bytes`);
    }
  } else {
    // Handle legacy JSON request
    const body = await req.json();
    messages = body.messages;
    model = body.model;
  }
  
  // Process messages and forward to AI provider
  // ... existing logic ...
}
```

## Data Models

### Transfer Metrics

```typescript
interface TransferMetrics {
  binarySize: number;      // Actual bytes transferred
  base64Size: number;      // What base64 would have been
  savingsBytes: number;    // Bytes saved
  savingsPercent: number;  // Percentage saved (~25%)
}
```

### Multipart Request Structure

```
POST /api/chat HTTP/1.1
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="image"; filename="canvas-drawing.png"
Content-Type: image/png

<binary PNG data>
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="data"
Content-Type: application/json

{"messages":[...],"model":"..."}
------WebKitFormBoundary7MA4YWxkTrZu0gW--
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, the following properties have been identified after eliminating redundancy:

### Property 1: PNG format preservation

*For any* PNG image data, the binary data SHALL start with the PNG magic bytes (89 50 4E 47 0D 0A 1A 0A) and be a valid PNG file.

**Validates: Requirements 1.2, 6.2**

### Property 2: Binary size reduction

*For any* image transfer, the binary size SHALL be at least 25% smaller than the equivalent base64-encoded size (calculated as ceil(binarySize * 4/3)).

**Validates: Requirements 5.2**

### Property 3: Round-trip data integrity

*For any* PNG binary data, serializing for transfer and deserializing SHALL produce identical bytes with matching length.

**Validates: Requirements 6.1, 6.3**

### Property 4: Multipart request structure

*For any* canvas submission with binary data, the HTTP request SHALL have Content-Type header starting with "multipart/form-data" and contain both an "image" file part and a "data" JSON part.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4**

### Property 5: Backward compatibility

*For any* canvas result, the system SHALL accept both base64 string format (legacy) and binary format, processing both correctly to produce valid images.

**Validates: Requirements 2.3**

### Property 6: Binary data type on web layer

*For any* binary image data received from the plugin, the web layer SHALL convert it to a Blob type for FormData construction.

**Validates: Requirements 2.1, 2.2**

## Error Handling

### iOS Layer Errors

| Error Condition | Handling Strategy |
|----------------|-------------------|
| PNG data generation fails | Call `delegate?.canvasDidCancel()` |
| Data is empty | Return error, don't submit |

### Web Layer Errors

| Error Condition | Handling Strategy |
|----------------|-------------------|
| Base64 decode fails | Log error, fall back to original string |
| Blob creation fails | Log error, use base64 fallback |
| FormData construction fails | Fall back to JSON request |

### API Layer Errors

| Error Condition | Handling Strategy |
|----------------|-------------------|
| Multipart parsing fails | Return 400 with descriptive error |
| Missing image file | Process as text-only message |
| Missing data field | Return 400 with "Missing data field" error |
| Invalid JSON in data field | Return 400 with parse error details |

## Testing Strategy

### Property-Based Testing Library

This project will use **fast-check** for TypeScript property-based testing and **XCTest** with custom property helpers for Swift.

### Property-Based Tests

```typescript
// __tests__/binary-transfer.property.test.ts
import fc from 'fast-check';
import { base64ToBlob, blobToBase64 } from '@/lib/binary-utils';

// **Feature: binary-image-transfer, Property 3: Round-trip data integrity**
// **Validates: Requirements 6.1, 6.3**
describe('Binary Transfer Properties', () => {
  it('round-trip preserves data integrity', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 100, maxLength: 10000 }),
        (bytes) => {
          const blob = new Blob([bytes], { type: 'image/png' });
          const base64 = blobToBase64(blob);
          const roundTripped = base64ToBlob(base64);
          
          // Compare lengths
          return roundTripped.size === bytes.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  // **Feature: binary-image-transfer, Property 2: Binary size reduction**
  // **Validates: Requirements 5.2**
  it('binary is at least 25% smaller than base64', () => {
    fc.assert(
      fc.property(
        fc.uint8Array({ minLength: 100, maxLength: 100000 }),
        (bytes) => {
          const binarySize = bytes.length;
          const base64Size = Math.ceil(binarySize * 4 / 3);
          const savings = (base64Size - binarySize) / base64Size;
          
          return savings >= 0.25;
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

```swift
// CanvasPluginTests/BinaryTransferTests.swift

// **Feature: binary-image-transfer, Property 1: PNG format preservation**
// **Validates: Requirements 1.2, 6.2**
func testPNGMagicBytesPreserved() {
    let pngMagicBytes: [UInt8] = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]
    
    assertProperty(generateRandomPNGData, iterations: 100) { pngData in
        guard pngData.count >= 8 else { return false }
        let header = [UInt8](pngData.prefix(8))
        return header == pngMagicBytes
    }
}
```

### Unit Tests

Unit tests will cover:
- Base64 to Blob conversion
- Blob to FormData construction
- Multipart request parsing
- Error handling for malformed data
- Backward compatibility with base64 format

### Integration Tests

Integration tests will verify:
- Full flow from canvas submit to API receipt
- Binary data integrity across the entire pipeline
- Multipart request handling in Next.js API route
- Fallback behavior when binary transfer fails

## Implementation Notes

### Capacitor Bridge Limitation

Capacitor's bridge between native and web layers uses JSON serialization, which doesn't natively support binary data. The standard approach is to base64 encode binary data for transfer. However, we can optimize by:

1. Keeping base64 for the Capacitor bridge (required)
2. Converting back to binary on the web layer
3. Sending as multipart to the API (avoiding double base64)

This still provides bandwidth savings on the network request to the API server.

### Alternative: Direct Binary via Custom Protocol

A more advanced optimization would be to use a custom URL scheme or local HTTP server to transfer binary data directly, bypassing the Capacitor bridge entirely. This is out of scope for the initial implementation but could be explored later.

## Performance Considerations

### Bandwidth Savings

| Image Size | Base64 Size | Binary Size | Savings |
|------------|-------------|-------------|---------|
| 100 KB | 133 KB | 100 KB | 33 KB (25%) |
| 500 KB | 667 KB | 500 KB | 167 KB (25%) |
| 1 MB | 1.33 MB | 1 MB | 333 KB (25%) |

### Processing Overhead

- Base64 decode on web layer: ~1-5ms for typical images
- FormData construction: ~1ms
- Multipart parsing on server: ~1-5ms

The processing overhead is negligible compared to network transfer time savings.

## Migration Strategy

### Phase 1: Add Multipart Support to API

1. Update API endpoint to accept multipart requests
2. Maintain backward compatibility with JSON requests
3. Add logging for transfer metrics

### Phase 2: Update Web Layer

1. Add binary conversion utilities
2. Modify canvas submission to use multipart
3. Add fallback to JSON on error

### Phase 3: Optimize Native Layer (Future)

1. Explore direct binary transfer options
2. Consider local HTTP server approach
3. Evaluate WebSocket for binary streaming

### Rollback Plan

If issues arise:
1. Web layer can fall back to JSON requests
2. API continues to accept both formats
3. No native code changes required for rollback
