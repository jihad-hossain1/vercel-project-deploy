import { Request, Response } from "express";
declare class DepartmentController {
    create(req: Request, res: Response): Promise<void>;
    update(req: Request, res: Response): Promise<void>;
    get(req: Request, res: Response): Promise<void>;
    getById(req: Request, res: Response): Promise<void>;
    delete(req: Request, res: Response): Promise<void>;
}
declare const _default: DepartmentController;
export default _default;
//# sourceMappingURL=department.controller.d.ts.map