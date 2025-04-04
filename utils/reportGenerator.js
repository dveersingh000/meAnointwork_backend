import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateReportPdf = (results, userEmail) => {
  return new Promise((resolve, reject) => {
    const fileName = `${userEmail.split('@')[0]}_report_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../reports', fileName);

    // Ensure reports directory exists
    if (!fs.existsSync(path.join(__dirname, '../reports'))) {
      fs.mkdirSync(path.join(__dirname, '../reports'), { recursive: true });
    }

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(20).text('Task Submission Report', { align: 'center' });
    doc.moveDown();

    results.forEach((task, index) => {
      doc.fontSize(14).text(`${index + 1}. Page: ${task.pageName}`);
      doc.fontSize(12).text(`   - Accuracy: ${task.accuracy}%`);
      doc.fontSize(12).text(`   - Plagiarism: ${task.plagiarism || 'N/A'}`);
      doc.moveDown();
    });

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};
