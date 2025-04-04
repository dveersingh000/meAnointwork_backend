import Tesseract from 'tesseract.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract text from image using OCR
 * @param {string} filename - image filename (inside /uploads)
 * @returns {Promise<string>} extracted text
 */
export const extractTextFromImage = async (filename) => {
  const imagePath = path.join(__dirname, '../uploads', filename);

  try {
    const result = await Tesseract.recognize(imagePath, 'eng', {
      logger: (m) => console.log(`[OCR] ${m.status}: ${Math.round(m.progress * 100)}%`)
    });

    const text = result?.data?.text || '';
    return text.trim();
  } catch (err) {
    console.error('OCR failed:', err);
    return '';
  }
};
