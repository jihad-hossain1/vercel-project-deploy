import nodemailer from "nodemailer";
import { Buffer } from "buffer";
import dotenv from "dotenv";
dotenv.config();

const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;
const mailHost = process.env.MAIL_HOST;
const mailPort = process.env.MAIL_PORT;

interface MailProps {
  to: string;
  subject: string;
  html: string;
  imgData?: string;
}

interface MailOptions {
  from: string | undefined;
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    encoding: string;
  }>;
}

async function createTransporter() {
  const transport = nodemailer.createTransport({
    host: mailHost,
    port: Number(mailPort),
    secure: mailPort === "465",
    auth: {
      user: mailUser,
      pass: mailPass,
    },
  });
  return transport;
}

const sendMail = async (props: MailProps): Promise<{ success: boolean; messageId?: string; error?: string }> => {
  const { to, subject, html, imgData } = props;
  try {
    const transporter = await createTransporter();
    const mailOptions: MailOptions = {
      from: mailUser,
      to,
      subject,
      html,
    };

    if (imgData) {
      const buffer = Buffer.from(imgData.split(",")[1], "base64");
      mailOptions.attachments = [
        {
          filename: "invoice.png",
          content: buffer,
          encoding: "base64",
        },
      ];
    }

    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export {
  sendMail,
};
