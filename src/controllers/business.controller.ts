import BusinessService from "../service/business.service";
import { Request, Response } from "express";

class BusinessController {
  async update(req: Request, res: Response) {
    const { businessId, isStockManaged } = req.body;
    try {
      const response = await BusinessService.update(businessId, isStockManaged);
      res.status(200).json(response);
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: (error as Error).message });
    }
  }
}

export default new BusinessController();
