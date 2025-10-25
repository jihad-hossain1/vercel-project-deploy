import { Request, Response } from "express";
declare class CodesController {
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    get(req: Request, res: Response): Promise<void>;
    archive(req: Request, res: Response): Promise<void>;
    searchCodes(req: Request, res: Response): Promise<void>;
}
declare const _default: CodesController;
export default _default;
//# sourceMappingURL=codes.controller.d.ts.map