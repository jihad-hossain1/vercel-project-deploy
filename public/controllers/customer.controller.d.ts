import { Request, Response } from "express";
declare class CustomerController {
    createCustomer(req: Request, res: Response): Promise<void>;
    getCustomerById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCustomersByBusiness(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateCustomer(req: Request, res: Response): Promise<void>;
    deleteCustomer(req: Request, res: Response): Promise<void>;
    searchCustomers(req: Request, res: Response): Promise<void>;
    archiveCustomer(req: Request, res: Response): Promise<void>;
    customerSalesAnalytics(req: Request, res: Response): Promise<void>;
}
declare const _default: CustomerController;
export default _default;
//# sourceMappingURL=customer.controller.d.ts.map