import constants from "../config/constants";

class MailService {
  _isSendMailSuccess = false;
  // private method
  async _sendMail({ email, data }: { email: string; data: any }) {
    // send mail to email no
    try {
      const response = await fetch(constants.mailConfig.api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mailTo: email,
          providerMailNo: constants.mailConfig.provider,
          subject: "[constants.mailConfig.api_json_body.subject]",
          mailTemplate: "constants.mailConfig.api_json_body.mailTemplate",
        }),
      });
      const responseData = (await response.json()) as { success: boolean };
      if (responseData?.success) {
        this._isSendMailSuccess = true;
        this.sendToCallback();
      } else {
        return { error: "mail not send" };
      }

      return responseData;
    } catch (error) {
      throw error;
    }
  }

  async sendToCallback() {
    if (this._isSendMailSuccess) {
      await fetch(constants.mailConfig.callback_api, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          providerMailNo: constants.mailConfig.provider,
        }),
      });
    }
  }

  async send({ email, data }: { email: string; data: any }) {
    try {
      // send mail to email no
      await this._sendMail({ email, data });
    } catch (error) {
      throw error;
    }
  }
}

const mailService = new MailService();

export default {
  sendMail: mailService.send.bind(mailService),
};
