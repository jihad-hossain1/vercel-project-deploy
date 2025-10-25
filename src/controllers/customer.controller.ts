import customerService from "../service/customer.service";
import { Request, Response } from "express";

class CustomerController {
  // Create a new customer
  async createCustomer(req: Request, res: Response) {
    try {
      const json_data = req.body;
      const newCustomer = await customerService.createCustomer(json_data);
      res.status(201).json(newCustomer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Get customer by ID
  async getCustomerById(req: Request, res: Response) {
    try {
      const { customerId, businessId } = req.query;

      if (!customerId || !businessId) {
        return res.status(400).json({
          success: false,
          message: "customerId and businessId are required",
        });
      }
      const customer = await customerService.getCustomerById({
        customerId: Number(customerId),
        businessId: Number(businessId),
      });

      return res.status(200).json(customer);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Get customers by business
  async getCustomersByBusiness(req: Request, res: Response) {
    try {
      const { businessId } = req.params;
      const { limit = 10, offset = 0, query = "", page = 1 } = req.query;
      if (!businessId) {
        return res.status(400).json({
          success: false,
          message: "businessId is required",
        });
      }
      const customers = await customerService.getCustomersByBusiness({
        businessId: Number(businessId),
        limit: Number(limit),
        offset: Number(offset),
        query: String(query),
        page: Number(page),
      });

      return res.status(200).json(customers);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Update customer
  async updateCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.createdAt;

      const updatedCustomer = await customerService.updateCustomer(
        Number(id),
        updateData
      );

      res.status(200).json(updatedCustomer);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Delete customer
  async deleteCustomer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await customerService.deleteCustomer(parseInt(id));

      res.status(200).json({
        success: true,
        message: "Customer deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Search customers
  async searchCustomers(req: Request, res: Response) {
    try {
      const { businessId } = req.params;
      const { searchTerm = "", limit = 10 } = req.query;

      const customers = await customerService.searchCustomers({
        businessId: parseInt(businessId),
        searchTerm,
        limit: Number(limit),
      });

      res.status(200).json(customers);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Archive customer
  async archiveCustomer(req: Request, res: Response) {
    try {
      const { businessId, customerId } = req.params;
      const { isActive } = req.body;

      const result = await customerService.archiveCustomer({
        businessId: Number(businessId),
        customerId: Number(customerId),
        isActive,
      });

      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async customerSalesAnalytics(req: Request, res: Response) {
    try {
      const { businessId, customerId } = req.params;
      const { limit = 10, offset = 0, page = 1 } = req.query;

      const analytics = await customerService.customerSalesAnalytics({
        businessId: parseInt(businessId),
        customerId: parseInt(customerId),
        limit: Number(limit),
        offset: Number(offset),
        page: Number(page),
      });

      res.status(200).json(analytics);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}

export default new CustomerController();
