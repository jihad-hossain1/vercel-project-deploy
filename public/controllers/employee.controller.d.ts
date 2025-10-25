import { Request, Response } from "express";
declare class EmployeeController {
    createEmployee(req: Request, res: Response): Promise<void>;
    getEmployeeById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getEmployeesByBusiness(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateEmployee(req: Request, res: Response): Promise<void>;
}
declare const _default: EmployeeController;
export default _default;
//# sourceMappingURL=employee.controller.d.ts.map