import { Request, Response } from "express";
declare class InvoiceController {
    createInvoice(req: Request, res: Response): Promise<void>;
    getInvoicesByBusiness(req: Request, res: Response): Promise<void>;
    updateInvoice(req: Request, res: Response): Promise<void>;
    getInvoiceById(req: Request, res: Response): Promise<void>;
}
declare const _default: InvoiceController;
export default _default;
//# sourceMappingURL=invoice.controller.d.ts.map