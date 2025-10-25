import { Request, Response } from "express";
declare class PurchaseClientController {
    createPurchaseClient(req: Request, res: Response): Promise<void>;
    getBusinessPurchaseClient(req: Request, res: Response): Promise<void>;
    getPurchaseClientsByBusiness(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updatePurchaseClient(req: Request, res: Response): Promise<void>;
    archivePurchaseClient(req: Request, res: Response): Promise<void>;
    searchClients(req: Request, res: Response): Promise<void>;
}
declare const _default: PurchaseClientController;
export default _default;
//# sourceMappingURL=purchase-client.controller.d.ts.map