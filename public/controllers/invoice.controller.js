"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const invoice_service_1 = __importDefault(require("../service/invoice.service"));
class InvoiceController {
    async createInvoice(req, res) {
        try {
            const reqBody = req.body;
            const getHeaderAuthToken = req.headers["_auth_token"] || "";
            const result = await invoice_service_1.default.createInvoice(reqBody, getHeaderAuthToken);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getInvoicesByBusiness(req, res) {
        try {
            const { businessId } = req.params;
            const { limit = 10, offset = 0, query = "", page = 1, fromDate = "", toDate = "" } = req.query;
            const result = await invoice_service_1.default.getInvoicesByBusiness(Number(businessId), {
                limit: Number(limit),
                offset: Number(offset),
                query: query,
                page: Number(page),
                fromDate: fromDate,
                toDate: toDate,
            });
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async updateInvoice(req, res) {
        try {
            const { businessId, id } = req.params;
            const reqBody = req.body;
            const result = await invoice_service_1.default.updateInvoice(Number(businessId), Number(id), reqBody);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getInvoiceById(req, res) {
        try {
            const { businessId, id } = req.params;
            const result = await invoice_service_1.default.getInvoiceById(Number(businessId), Number(id));
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.default = new InvoiceController();
//# sourceMappingURL=invoice.controller.js.map