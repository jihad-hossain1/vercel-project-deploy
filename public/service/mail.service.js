"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const buffer_1 = require("buffer");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mailUser = process.env.MAIL_USER;
const mailPass = process.env.MAIL_PASS;
const mailHost = process.env.MAIL_HOST;
const mailPort = process.env.MAIL_PORT;
async function createTransporter() {
    const transport = nodemailer_1.default.createTransport({
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
const sendMail = async (props) => {
    const { to, subject, html, imgData } = props;
    try {
        const transporter = await createTransporter();
        const mailOptions = {
            from: mailUser,
            to,
            subject,
            html,
        };
        if (imgData) {
            const buffer = buffer_1.Buffer.from(imgData.split(",")[1], "base64");
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
    }
    catch (error) {
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
};
exports.sendMail = sendMail;
//# sourceMappingURL=mail.service.js.map