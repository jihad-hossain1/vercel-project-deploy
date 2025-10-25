import nodemailer from "nodemailer";
import { Buffer } from "buffer";

// Define interfaces for type safety
interface MailProps {
  to: string;
  subject: string;
  html: string;
  imgData?: string;
}

interface MailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    encoding: string;
  }>;
}

// Configure the transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: false,
  auth: {
    user: "lovedose4166@gmail.com",
    pass: "vrtp adkg lrga uvgt",
  },
});

/**
 * Sends an email with optional image attachment
 * @param {MailProps} mailProps - The email properties
 * @returns {Promise<MailResponse>} The response containing success status and optional messageId or error
 */
async function sendEmails({ to, subject, html, imgData }: MailProps): Promise<MailResponse> {
  try {
    // Define mail options
    const mailOptions: MailOptions = {
      from: "lovedose4166@gmail.com",
      to,
      subject,
      html,
    };

    // Add image as an attachment if provided
    if (imgData) {
      const buffer = Buffer.from(imgData.split(",")[1], "base64");
      mailOptions.attachments = [
        {
          filename: "file.png",
          content: buffer,
          encoding: "base64",
        },
      ];
    }

    // Send email
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'An unknown error occurred while sending email' };
  }
}

export { sendEmails, type MailProps, type MailResponse };
