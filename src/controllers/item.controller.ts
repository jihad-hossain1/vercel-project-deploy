import itemService from "../service/item.service";
import { Request, Response } from "express";

class ItemController {
  // Create a new item
  async createItem(req: Request, res: Response) {
    try {
      const jsonData = req.body;
      const newItem = await itemService.createItem(jsonData);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Get item by ID
  async getItemById(req: Request, res: Response) {
    try {
      const { itemId, businessId } = req.query;

      if (!itemId || !businessId) {
        return res.status(400).json({
          success: false,
          message: "itemId and businessId are required",
        });
      }

      const item = await itemService.getItemById({
        businessId: Number(businessId),
        itemId: Number(itemId),
      });

      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Get items by business
  async getItemsByBusiness(req: Request, res: Response) {
    try {
      const { businessId } = req.params;
      const reqQuery = req.query;

      const items = await itemService.getItemsByBusiness({
        ...reqQuery,
        businessId: Number(businessId),
        limit: Number(reqQuery?.limit),
      });

      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Update item
  async updateItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.createdAt;

      const updatedItem = await itemService.updateItem({
        businessId: Number(updateData.businessId),
        itemId: Number(id),
        updateData,
      });

      res.status(200).json(updatedItem);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async archiveItem(req: Request, res: Response) {
    try {
      const { itemId, businessId } = req.params;
      const { isActive } = req.body;

      const archiveResponse = await itemService.archiveItem({
        businessId: Number(businessId),
        itemId: Number(itemId),
        isActive,
      });

      res.status(200).json(archiveResponse);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Delete item (soft delete)
  async deleteItem(req: Request, res: Response) {
    try {
      const { itemId, businessId } = req.params;
      await itemService.deleteItem({
        businessId: Number(businessId),
        itemId: Number(itemId),
      });

      res.status(200).json({
        success: true,
        message: "Item deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async searchItems(req: Request, res: Response) {
    try {
      const { businessId } = req.params;
      const { searchTerm = "", limit = 10 } = req.query;

      const items = await itemService.searchItems({
        searchTerm: searchTerm as string,
        businessId: Number(businessId),
        limit: Number(limit),
      });

      res.status(200).json(items);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Get item analysis
  async itemAnalysis(req: Request, res: Response) {
    try {
      const { businessId } = req.params;
      const {
        searchTerm = "",
        limit = 10,
        fromDate = "",
        toDate = "",
      } = req.query;

      const itemAnalysis = await itemService.itemAnalysis({
        businessId: Number(businessId),
        limit: Number(limit),
        searchTerm: searchTerm as string,
        fromDate: fromDate as string,
        toDate: toDate as string,
      });

      res.status(200).json(itemAnalysis);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Get item sales history
  async itemSalesHistory(req: Request, res: Response) {
    try {
      const { businessId, itemId } = req.params;
      const {
        limit,
        fromDate = "",
        toDate = "",
        searchTerm = "",
        page,
      } = req.query;

      const itemSalesHistory = await itemService.itemSalesHistory({
        businessId: Number(businessId),
        itemId: Number(itemId),
        limit: Number(limit),
        fromDate: fromDate as string,
        toDate: toDate as string,
        searchTerm: searchTerm as string,
        page: Number(page),
      });

      res.status(200).json(itemSalesHistory);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}

export default new ItemController();
