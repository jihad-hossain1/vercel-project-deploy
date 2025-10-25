import { Request, Response } from "express";
declare class PurchaseController {
    createPurchase(req: Request, res: Response): Promise<void>;
    getPurchaseById(req: Request, res: Response): Promise<void>;
    updatePurchase(req: Request, res: Response): Promise<void>;
    getPurchasesByBusiness(req: Request, res: Response): Promise<void>;
}
declare const _default: PurchaseController;
export default _default;
//# sourceMappingURL=purchase.controller.d.ts.map