/**
 * Binary utility functions for efficient image transfer.
 * Converts base64-encoded images to binary format for multipart requests.
 */

/**
 * Transfer metrics for comparing binary vs base64 transfer efficiency.
 */
export interface TransferMetrics {
  /** Actual bytes transferred in binary format */
  binarySize: number;
  /** What the size would have been with base64 encoding */
  base64Size: number;
  /** Bytes saved by using binary transfer */
  savingsBytes: number;
  /** Percentage saved (~25% for typical images) */
  savingsPercent: number;
}

/**
 * Converts a base64 data URL to a Blob.
 * Handles data URL prefix removal and uses atob() with Uint8Array for conversion.
 * 
 * @param base64DataUrl - Base64 encoded data URL (e.g., "data:image/png;base64,...")
 * @returns Blob containing the binary image data
 */
export function base64ToBlob(base64DataUrl: string): Blob {
  // Remove data URL prefix if present (e.g., "data:image/png;base64,")
  const base64 = base64DataUrl.replace(/^data:image\/\w+;base64,/, '');
  
  // Decode base64 to binary string
  const binaryString = atob(base64);
  
  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return new Blob([bytes], { type: 'image/png' });
}

/**
 * Creates a multipart FormData object with image and message data.
 * 
 * @param imageBlob - Blob containing the binary image data
 * @param messageData - Object containing message data to be sent as JSON
 * @returns FormData with image as file attachment and message data as JSON string
 */
export function createMultipartFormData(
  imageBlob: Blob,
  messageData: object
): FormData {
  const formData = new FormData();
  
  // Add image as file attachment
  formData.append('image', imageBlob, 'canvas-drawing.png');
  
  // Add message data as JSON string in separate field
  formData.append('data', JSON.stringify(messageData));
  
  return formData;
}

/**
 * Calculates transfer metrics comparing binary vs base64 transfer.
 * 
 * @param binarySize - Size of the binary data in bytes
 * @returns TransferMetrics object with size comparison and savings
 */
export function calculateTransferMetrics(binarySize: number): TransferMetrics {
  // Base64 encoding adds ~33% overhead (4/3 ratio)
  const base64Size = Math.ceil(binarySize * 4 / 3);
  const savingsBytes = base64Size - binarySize;
  const savingsPercent = (savingsBytes / base64Size) * 100;
  
  return {
    binarySize,
    base64Size,
    savingsBytes,
    savingsPercent
  };
}
