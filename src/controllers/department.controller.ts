import departmentService from "../service/department.service";
import { Request, Response } from "express";

class DepartmentController {
  async create(req: Request, res: Response) {
    const json_data = req.body;
    try {
      const response = await departmentService.create(json_data);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async update(req: Request, res: Response) {
    const json_data = req.body;
    const { id } = req.params;
    try {
      const response = await departmentService.update(Number(id), json_data);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async get(req: Request, res: Response) {
    const reqQuery = req.query;
    try {
      const response = await departmentService.get({
        ...reqQuery,
        businessId: Number(reqQuery?.businessId),
        page: Number(reqQuery?.page),
        limit: Number(reqQuery?.limit),
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async getById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const response = await departmentService.getById(Number(id));
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const response = await departmentService.delete(id);
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}

export default new DepartmentController();
