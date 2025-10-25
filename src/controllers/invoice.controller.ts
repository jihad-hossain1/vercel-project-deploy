import jwtService from "../utils/jwt.service";
import invoiceService from "../service/invoice.service";
import { Request, Response } from "express";

class InvoiceController {
    // Create a new invoice
    async createInvoice(req: Request, res: Response) {
        try {
            const reqBody = req.body;
            const getHeaderAuthToken = req.headers["_auth_token"] || "";

            const result = await invoiceService.createInvoice(reqBody, getHeaderAuthToken as string);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: (error as Error).message,
            });
        }
    }

    // Get invoices by business
    async getInvoicesByBusiness(req: Request, res: Response) {
        try {
            const { businessId } = req.params;
            const { limit = 10, offset = 0, query = "", page = 1, fromDate = "", toDate = "" } = req.query;

            const result = await invoiceService.getInvoicesByBusiness(Number(businessId), {
                limit: Number(limit),
                offset: Number(offset),
                query: query as string,
                page: Number(page),
                fromDate: fromDate as string,
                toDate: toDate as string,
            });
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: (error as Error).message,
            });
        }
    }

    // Update invoice
    async updateInvoice(req: Request, res: Response) {
        try {
            const { businessId, id } = req.params;
            const reqBody = req.body;
            const result = await invoiceService.updateInvoice(Number(businessId), Number(id), reqBody);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: (error as Error).message,
            });
        }
    }

    // Get invoice by id
    async getInvoiceById(req: Request, res: Response) {
        try {
            const { businessId, id } = req.params;
            const result = await invoiceService.getInvoiceById(Number(businessId), Number(id));
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: (error as Error).message,
            });
        }
    }
}

export default new InvoiceController();
