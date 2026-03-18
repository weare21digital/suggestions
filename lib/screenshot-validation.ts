/**
 * Server-side screenshot validation for bug reports.
 * Enforces MIME type, size limit, and magic byte verification.
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates a base64-encoded screenshot data URL.
 * 
 * Checks:
 * - Data URL format (data:image/...;base64,...)
 * - MIME type (PNG, JPEG, GIF, WebP only)
 * - Size limit (5MB max, decoded)
 * - Magic bytes (file signature matches claimed type)
 * 
 * @param screenshot - Base64 data URL string
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateScreenshot(screenshot: string): ValidationResult {
  // Check data URL format
  if (!screenshot.startsWith('data:image/')) {
    return { valid: false, error: 'Invalid screenshot format. Must be a data URL.' };
  }

  // Extract and validate MIME type
  const mimeMatch = screenshot.match(/^data:(image\/(png|jpeg|gif|webp));base64,/);
  if (!mimeMatch) {
    return { 
      valid: false, 
      error: 'Invalid image type. Only PNG, JPEG, GIF, and WebP are allowed.' 
    };
  }

  const mimeType = mimeMatch[1];

  // Extract base64 data and decode
  const base64Data = screenshot.split(',')[1];
  if (!base64Data) {
    return { valid: false, error: 'Missing base64 data.' };
  }

  let buffer: Buffer;
  try {
    buffer = Buffer.from(base64Data, 'base64');
  } catch (error) {
    return { valid: false, error: 'Invalid base64 encoding.' };
  }

  // Check size (5MB limit)
  const sizeInMB = buffer.length / (1024 * 1024);
  if (sizeInMB > 5) {
    return { 
      valid: false, 
      error: `Screenshot too large (${sizeInMB.toFixed(2)}MB). Maximum size is 5MB.` 
    };
  }

  // Verify magic bytes match claimed MIME type
  const magicBytes = buffer.slice(0, 12);
  
  const isPNG = magicBytes[0] === 0x89 && 
                magicBytes[1] === 0x50 && 
                magicBytes[2] === 0x4E && 
                magicBytes[3] === 0x47;
  
  const isJPEG = magicBytes[0] === 0xFF && 
                 magicBytes[1] === 0xD8 && 
                 magicBytes[2] === 0xFF;
  
  const isGIF = magicBytes[0] === 0x47 && 
                magicBytes[1] === 0x49 && 
                magicBytes[2] === 0x46;
  
  const isWebP = magicBytes[0] === 0x52 && 
                 magicBytes[1] === 0x49 && 
                 magicBytes[2] === 0x46 && 
                 magicBytes[3] === 0x46 &&
                 magicBytes[8] === 0x57 && 
                 magicBytes[9] === 0x45 && 
                 magicBytes[10] === 0x42 && 
                 magicBytes[11] === 0x50;

  // Match magic bytes to claimed MIME
  const signatureValid = 
    (mimeType === 'image/png' && isPNG) ||
    (mimeType === 'image/jpeg' && isJPEG) ||
    (mimeType === 'image/gif' && isGIF) ||
    (mimeType === 'image/webp' && isWebP);

  if (!signatureValid) {
    return { 
      valid: false, 
      error: 'Invalid image signature. File content does not match claimed type.' 
    };
  }

  return { valid: true };
}
