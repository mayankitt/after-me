/**
 * File validation utilities.
 *
 * Validates uploaded files by:
 *  1. Enforcing an allowlist of permitted MIME types
 *  2. Cross-checking magic bytes (file signatures) against the declared type
 *  3. Enforcing a per-file size cap
 *
 * Magic-byte checking prevents attackers from disguising disallowed file types
 * (e.g. an executable renamed to .pdf) by simply lying about Content-Type.
 */

/** Maximum allowed file size: 50 MB */
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

/** MIME types that may be uploaded to the vault. */
export const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/tiff',
  // Microsoft Office (legacy)
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  // Microsoft Office (OOXML / modern)
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  // OpenDocument
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  // Plain text
  'text/plain',
]);

interface MagicSignature {
  /** Declared MIME types this signature applies to. */
  mimes: string[];
  /** Expected bytes at the given offset. */
  bytes: number[];
  /** Byte offset to start comparing (default: 0). */
  offset?: number;
}

/**
 * Known file-format signatures.
 * A file passes if ANY signature whose mimes include the declared type matches.
 * Types not listed here (e.g. text/plain) skip byte-level checking.
 */
const SIGNATURES: MagicSignature[] = [
  // PDF  %PDF
  { mimes: ['application/pdf'], bytes: [0x25, 0x50, 0x44, 0x46] },
  // JPEG  FF D8 FF
  { mimes: ['image/jpeg'], bytes: [0xff, 0xd8, 0xff] },
  // PNG  89 50 4E 47
  { mimes: ['image/png'], bytes: [0x89, 0x50, 0x4e, 0x47] },
  // GIF  47 49 46 38
  { mimes: ['image/gif'], bytes: [0x47, 0x49, 0x46, 0x38] },
  // WEBP  RIFF at 0, WEBP at 8
  { mimes: ['image/webp'], bytes: [0x52, 0x49, 0x46, 0x46], offset: 0 },
  // TIFF  49 49 2A 00 (little-endian) or 4D 4D 00 2A (big-endian)
  { mimes: ['image/tiff'], bytes: [0x49, 0x49, 0x2a, 0x00] },
  { mimes: ['image/tiff'], bytes: [0x4d, 0x4d, 0x00, 0x2a] },
  // OLE2 compound doc (legacy Office: .doc, .xls, .ppt)
  {
    mimes: [
      'application/msword',
      'application/vnd.ms-excel',
      'application/vnd.ms-powerpoint',
    ],
    bytes: [0xd0, 0xcf, 0x11, 0xe0],
  },
  // ZIP  50 4B 03 04  (modern Office OOXML + ODF are all ZIP-based)
  {
    mimes: [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
    ],
    bytes: [0x50, 0x4b, 0x03, 0x04],
  },
];

/** Types whose content is variable enough that magic-byte checking is skipped. */
const SKIP_MAGIC_CHECK = new Set(['text/plain']);

function matchesSignature(buf: Buffer, sig: MagicSignature): boolean {
  const offset = sig.offset ?? 0;
  if (buf.length < offset + sig.bytes.length) return false;
  return sig.bytes.every((b, i) => buf[offset + i] === b);
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate a file buffer against its declared MIME type and size.
 *
 * @param buffer   The raw file bytes (only the first 16 bytes are needed for
 *                 magic-byte checks, but the full buffer is accepted).
 * @param mimeType The MIME type declared by the client.
 * @param sizeBytes The total file size in bytes.
 */
export function validateFile(
  buffer: Buffer,
  mimeType: string,
  sizeBytes: number,
): ValidationResult {
  // 1. Size check
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File size ${(sizeBytes / 1024 / 1024).toFixed(1)} MB exceeds the 50 MB limit.`,
    };
  }

  // 2. MIME allowlist
  const normalised = mimeType.split(';')[0].trim().toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(normalised)) {
    return {
      valid: false,
      error: `File type "${normalised}" is not permitted. Allowed types: PDF, images (JPEG/PNG/GIF/WebP/TIFF), Word, Excel, PowerPoint, and plain text.`,
    };
  }

  // 3. Magic-byte check (skip for types without reliable signatures)
  if (!SKIP_MAGIC_CHECK.has(normalised)) {
    const relevantSigs = SIGNATURES.filter((s) => s.mimes.includes(normalised));
    if (relevantSigs.length > 0) {
      const matched = relevantSigs.some((s) => matchesSignature(buffer, s));
      if (!matched) {
        return {
          valid: false,
          error: `File content does not match the declared type "${normalised}". The file may be corrupt or disguised.`,
        };
      }
    }
  }

  return { valid: true };
}
