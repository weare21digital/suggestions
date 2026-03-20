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
export declare function validateScreenshot(screenshot: string): ValidationResult;
