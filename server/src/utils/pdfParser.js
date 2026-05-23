/**
 * PDF Parser Service
 * Extracts plain text from resume PDF buffers (pdf-parse v2).
 */
const { PDFParse } = require('pdf-parse');
const ApiError = require('./ApiError');

const MAX_TEXT_LENGTH = 18000;

/**
 * parsePdfBuffer — extract and normalize text from a PDF file buffer.
 * @param {Buffer} buffer
 * @returns {{ text: string, pages: number, wordCount: number }}
 */
const parsePdfBuffer = async (buffer) => {
  if (!buffer?.length) {
    throw ApiError.badRequest('Empty file uploaded.');
  }

  let result;
  let parser;
  try {
    parser = new PDFParse({ data: buffer });
    result = await parser.getText();
  } catch {
    throw ApiError.badRequest(
      'Could not parse PDF. Ensure the file is a valid, text-based resume PDF.'
    );
  } finally {
    if (parser?.destroy) {
      try {
        await parser.destroy();
      } catch {
        /* ignore cleanup errors */
      }
    }
  }

  const raw = (result?.text || '').replace(/\s+/g, ' ').trim();

  if (!raw || raw.length < 80) {
    throw ApiError.badRequest(
      'Could not extract enough text from the PDF. Try a text-based PDF (not a scanned image).'
    );
  }

  const text = raw.length > MAX_TEXT_LENGTH ? `${raw.slice(0, MAX_TEXT_LENGTH)}…` : raw;
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return {
    text,
    pages: result?.total || result?.pages?.length || 1,
    wordCount,
  };
};

module.exports = { parsePdfBuffer, MAX_TEXT_LENGTH };
