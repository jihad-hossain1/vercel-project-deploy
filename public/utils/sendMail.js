"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmails = sendEmails;
const nodemailer_1 = __importDefault(require("nodemailer"));
const buffer_1 = require("buffer");
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: false,
    auth: {
        user: "lovedose4166@gmail.com",
        pass: "vrtp adkg lrga uvgt",
    },
});
async function sendEmails({ to, subject, html, imgData }) {
    try {
        const mailOptions = {
            from: "lovedose4166@gmail.com",
            to,
            subject,
            html,
        };
        if (imgData) {
            const buffer = buffer_1.Buffer.from(imgData.split(",")[1], "base64");
            mailOptions.attachments = [
                {
                    filename: "file.png",
                    content: buffer,
                    encoding: "base64",
                },
            ];
        }
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    }
    catch (error) {
        if (error instanceof Error) {
            return { success: false, error: error.message };
        }
        return { success: false, error: 'An unknown error occurred while sending email' };
    }
}
//# sourceMappingURL=sendMail.js.map