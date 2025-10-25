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
declare function sendEmails({ to, subject, html, imgData }: MailProps): Promise<MailResponse>;
export { sendEmails, type MailProps, type MailResponse };
//# sourceMappingURL=sendMail.d.ts.map