import codesServices from "../service/codes.service";
import { Request, Response } from "express";

class CodesController {
  async create(req: Request, res: Response) {
    const json_data = req.body;
    try {
      const response = await codesServices.create(json_data);
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
    const { codeId } = req.params;
    try {
      const response = await codesServices.update(Number(codeId), json_data);
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
      const response = await codesServices.get({
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

  async archive(req: Request, res: Response) {
    const { id, businessId } = req.params;
    const { isActive } = req.body;

    try {
      const response = await codesServices.archive({
        businessId: Number(businessId),
        id: Number(id),
        isActive,
      });

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async searchCodes(req: Request, res: Response) {
    const { businessId } = req.params;
    const { limit = 10, searchTerm = "" } = req.query;

    try {
      const response = await codesServices.search({
        businessId: Number(businessId),
        limit: Number(limit),
        searchTerm,
      });

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}

export default new CodesController();
