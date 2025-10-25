import dashboardService from "../service/dashboard.service";
import { Request, Response } from "express";

class DashboardController {
  // Get dashboard statistics
  async getDashboardStats(req: Request, res: Response) {
    try {
      const { businessId } = req.query;
      if (!businessId) {
        return res.status(400).json({
          success: false,
          message: "businessId is required",
        });
      }
      const dashboardStats = await dashboardService.getDashboardStats(
        Number(businessId)
      );
      return res.status(200).json(dashboardStats);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}

export default new DashboardController();
