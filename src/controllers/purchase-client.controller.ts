import purchaseClientService from "../service/purchase-client.service";
import { Request, Response } from "express";

class PurchaseClientController {
  async createPurchaseClient(req: Request, res: Response) {
    const reqBody = req.body;
    try {
      const result = await purchaseClientService.createPurchaseClient(reqBody);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  }

  async getBusinessPurchaseClient(req: Request, res: Response) {
    try {
      const { id, businessId } = req.params;

      const client = await purchaseClientService.getBusinessPurchaseClient({
        id: Number(id),
        businessId: Number(businessId),
      });

      res.status(200).json(client);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  }

  async getPurchaseClientsByBusiness(req: Request, res: Response) {
    const { businessId } = req.params;
    const { limit = 10, offset = 0, query = "", page = 1 } = req.query;

    if (!businessId) {
      return res.status(400).json({
        success: false,
        error: "Business ID is required",
      });
    }

    const options = {
      limit: Number(limit),
      offset: Number(offset),
      page: Number(page),
      query: query as string,
    };

    try {
      const result = await purchaseClientService.getPurchaseClientsByBusiness(
        Number(businessId),
        options
      );

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  }

  async updatePurchaseClient(req: Request, res: Response) {
    try {
      const { id, businessId } = req.params;
      const updateData = req.body;

      // Remove fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const updatedClient = await purchaseClientService.updatePurchaseClient({
        id: Number(id),
        updateData: {
          ...updateData,
        },
        businessId: parseInt(businessId),
      });

      res.status(200).json(updatedClient);
    } catch (error) {
      console.error("Error updating purchase client:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  }

  async archivePurchaseClient(req: Request, res: Response) {
    try {
      const { id, businessId } = req.params;
      const { isActive } = req.body;

      const result = await purchaseClientService.archivePurchaseClient({
        businessId: Number(businessId),
        id: Number(id),
        isActive,
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: (error as Error).message,
      });
    }
  }

  async searchClients(req: Request, res: Response) {
    const { businessId } = req.params;
    const { searchTerm = "", limit = 10 } = req.query;

    try {
      const response = await purchaseClientService.searchClients({
        businessId: Number(businessId),
        limit: Number(limit),
        searchTerm: searchTerm as string,
      });
      res.status(200).json(response);
    } catch (error) {
      res
        .status(500)
        .json({
          success: false,
          message: "Internal server error",
          error: (error as Error).message,
        });
    }
  }
}

export default new PurchaseClientController();
