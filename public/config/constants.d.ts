declare const constants: {
    mailConfig: {
        provider: string;
        api: string;
        callback_api: string;
        callback_api_json_body: {
            providerMailNo: string;
        };
        api_json_body: {
            mailTo: string;
            providerMailNo: string;
            subject: string;
            mailTemplate: string;
        };
    };
    invoiceStatus: {
        PAID: string;
        UNPAID: string;
        CREDIT: string;
        ARCHIVED: string;
    };
};
export default constants;
//# sourceMappingURL=constants.d.ts.map