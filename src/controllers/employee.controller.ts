import employeeService from "../service/employee.service";
import { Request, Response } from "express";

class EmployeeController {
  // Create a new Employee
  async createEmployee(req: Request, res: Response) {
    try {
      const json_data = req.body;
      const newEmployee = await employeeService.createEmployee(json_data);
      res.status(201).json(newEmployee);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Get employee by ID
  async getEmployeeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { businessId } = req.query;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          message: "businessId is required",
        });
      }

      const employee = await employeeService.getEmployeeById({
        id: Number(id),
        businessId: Number(businessId),
      });

      return res.status(200).json(employee);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Get employees by business
  async getEmployeesByBusiness(req: Request, res: Response) {
    try {
      const {
        limit = 10,
        offset = 0,
        query = "",
        page = 1,
        businessId,
      } = req.query;

      if (!businessId) {
        return res.status(400).json({
          success: false,
          message: "businessId is required",
        });
      }

      const employees = await employeeService.getEmployeesByBusiness({
        businessId: Number(businessId),
        limit: Number(limit),
        offset: Number(offset),
        query: query as string,
        page: Number(page),
      });

      return res.status(200).json(employees);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Update employee
  async updateEmployee(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.createdAt;

      const updatedEmployee = await employeeService.updateEmployee(
        Number(id),
        updateData
      );

      res.status(200).json(updatedEmployee);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}

export default new EmployeeController();
