import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const sendEmailWithAttachment = async (to, filePath) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // e.g., yourapp@gmail.com
        pass: process.env.EMAIL_PASS, // App password
      },
    });

    const mailOptions = {
      from: `"Teletype Team" <${process.env.EMAIL_USER}>`,
      to,
      subject: 'Your Task Submission Report',
      text: 'Hello,\n\nYour task submission report is attached.\n\nThank you.',
      attachments: [
        {
          filename: path.basename(filePath),
          path: filePath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`📬 Email sent to ${to}`);
  } catch (err) {
    console.error('❌ Failed to send email:', err);
    throw new Error('Email sending failed');
  }
};
