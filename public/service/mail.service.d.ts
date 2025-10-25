interface MailProps {
    to: string;
    subject: string;
    html: string;
    imgData?: string;
}
declare const sendMail: (props: MailProps) => Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
}>;
export { sendMail, };
//# sourceMappingURL=mail.service.d.ts.map