"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = __importDefault(require("../config/constants"));
class MailService {
    constructor() {
        this._isSendMailSuccess = false;
    }
    async _sendMail({ email, data }) {
        try {
            const response = await fetch(constants_1.default.mailConfig.api, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    mailTo: email,
                    providerMailNo: constants_1.default.mailConfig.provider,
                    subject: "[constants.mailConfig.api_json_body.subject]",
                    mailTemplate: "constants.mailConfig.api_json_body.mailTemplate",
                }),
            });
            const responseData = (await response.json());
            if (responseData?.success) {
                this._isSendMailSuccess = true;
                this.sendToCallback();
            }
            else {
                return { error: "mail not send" };
            }
            return responseData;
        }
        catch (error) {
            throw error;
        }
    }
    async sendToCallback() {
        if (this._isSendMailSuccess) {
            await fetch(constants_1.default.mailConfig.callback_api, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    providerMailNo: constants_1.default.mailConfig.provider,
                }),
            });
        }
    }
    async send({ email, data }) {
        try {
            await this._sendMail({ email, data });
        }
        catch (error) {
            throw error;
        }
    }
}
const mailService = new MailService();
exports.default = {
    sendMail: mailService.send.bind(mailService),
};
//# sourceMappingURL=mail.js.map