"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants = {
    mailConfig: {
        provider: "lovedose4166@gmail.com",
        api: "https://serviceinmail.vercel.app/api/v1/send-mail",
        callback_api: "https://serviceinmail.vercel.app/api/v1/send-mail",
        callback_api_json_body: {
            providerMailNo: "Your register mail no",
        },
        api_json_body: {
            mailTo: "Receiver mail no.",
            providerMailNo: "Your register mail no",
            subject: "Your mail subject",
            mailTemplate: "Your mail template",
        },
    },
    invoiceStatus: {
        PAID: "paid",
        UNPAID: "unpaid",
        CREDIT: "credit",
        ARCHIVED: "archived",
    },
};
exports.default = constants;
//# sourceMappingURL=constants.js.map