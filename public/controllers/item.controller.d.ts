import { Request, Response } from "express";
declare class ItemController {
    createItem(req: Request, res: Response): Promise<void>;
    getItemById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getItemsByBusiness(req: Request, res: Response): Promise<void>;
    updateItem(req: Request, res: Response): Promise<void>;
    archiveItem(req: Request, res: Response): Promise<void>;
    deleteItem(req: Request, res: Response): Promise<void>;
    searchItems(req: Request, res: Response): Promise<void>;
    itemAnalysis(req: Request, res: Response): Promise<void>;
    itemSalesHistory(req: Request, res: Response): Promise<void>;
}
declare const _default: ItemController;
export default _default;
//# sourceMappingURL=item.controller.d.ts.map