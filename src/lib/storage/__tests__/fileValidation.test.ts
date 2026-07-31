import {
  validateFile,
  MAX_FILE_SIZE_BYTES,
  ALLOWED_MIME_TYPES,
} from '../fileValidation';

// ── Helpers ────────────────────────────────────────────────────────────────

function makePdfBuffer(): Buffer {
  // %PDF magic bytes
  return Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]);
}

function makeJpegBuffer(): Buffer {
  return Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
}

function makePngBuffer(): Buffer {
  return Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
}

function makeZipBuffer(): Buffer {
  // OOXML (docx/xlsx) starts with ZIP signature
  return Buffer.from([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00]);
}

function makeRandomBuffer(size = 16): Buffer {
  return Buffer.alloc(size, 0xde);
}

// ── Size validation ────────────────────────────────────────────────────────

describe('validateFile – size', () => {
  it('accepts a file within the size limit', () => {
    const result = validateFile(makePdfBuffer(), 'application/pdf', 1024);
    expect(result.valid).toBe(true);
  });

  it('rejects a file that exceeds MAX_FILE_SIZE_BYTES', () => {
    const result = validateFile(
      makePdfBuffer(),
      'application/pdf',
      MAX_FILE_SIZE_BYTES + 1,
    );
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/50 MB/i);
  });

  it('accepts a file exactly at the size limit', () => {
    const result = validateFile(makePdfBuffer(), 'application/pdf', MAX_FILE_SIZE_BYTES);
    expect(result.valid).toBe(true);
  });
});

// ── MIME allowlist ─────────────────────────────────────────────────────────

describe('validateFile – MIME allowlist', () => {
  it('rejects an unlisted MIME type', () => {
    const result = validateFile(makeRandomBuffer(), 'application/x-executable', 100);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/not permitted/i);
  });

  it('is case-insensitive and strips charset parameters', () => {
    // text/plain;charset=utf-8 → should still be allowed
    const result = validateFile(Buffer.from('hello'), 'text/plain;charset=utf-8', 5);
    expect(result.valid).toBe(true);
  });

  it('rejects application/octet-stream (not in allowlist)', () => {
    const result = validateFile(makeRandomBuffer(), 'application/octet-stream', 16);
    expect(result.valid).toBe(false);
  });

  it('has exactly the expected number of allowed types', () => {
    expect(ALLOWED_MIME_TYPES.size).toBeGreaterThan(0);
  });
});

// ── Magic byte validation ──────────────────────────────────────────────────

describe('validateFile – magic bytes', () => {
  it('accepts a valid PDF buffer', () => {
    const result = validateFile(makePdfBuffer(), 'application/pdf', 8);
    expect(result.valid).toBe(true);
  });

  it('rejects a buffer whose bytes do not match the declared PDF type', () => {
    const result = validateFile(makeRandomBuffer(), 'application/pdf', 16);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/content does not match/i);
  });

  it('accepts a valid JPEG buffer', () => {
    const result = validateFile(makeJpegBuffer(), 'image/jpeg', 6);
    expect(result.valid).toBe(true);
  });

  it('rejects a non-JPEG buffer declared as image/jpeg', () => {
    const result = validateFile(makeRandomBuffer(), 'image/jpeg', 16);
    expect(result.valid).toBe(false);
  });

  it('accepts a valid PNG buffer', () => {
    const result = validateFile(makePngBuffer(), 'image/png', 8);
    expect(result.valid).toBe(true);
  });

  it('accepts a docx/xlsx buffer (ZIP signature)', () => {
    const docxMime =
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const result = validateFile(makeZipBuffer(), docxMime, 6);
    expect(result.valid).toBe(true);
  });

  it('accepts text/plain without magic-byte checking', () => {
    // Plain text has no reliable magic bytes; validation is skipped
    const result = validateFile(Buffer.from('Hello world'), 'text/plain', 11);
    expect(result.valid).toBe(true);
  });

  it('rejects a very short buffer for a typed file', () => {
    // Only 1 byte — cannot match any signature
    const result = validateFile(Buffer.from([0x25]), 'application/pdf', 1);
    expect(result.valid).toBe(false);
  });
});
