const constants = {
  /**
   * @description get mail config
   * @returns {object} mail config
   */
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

  /**
   * @description get invoice status
   * @returns {object} invoice status
   */
  invoiceStatus: {
    PAID: "paid",
    UNPAID: "unpaid",
    CREDIT: "credit",
    ARCHIVED: "archived",
  },
};

export default constants;
