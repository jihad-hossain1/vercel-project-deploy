import jwtService from "../utils/jwt.service";
import purchaseService from "../service/purchase.service";
import { Request, Response } from "express";

class PurchaseController {
    async createPurchase(req: Request, res: Response) {
        const reqBody = req.body;
        try {
            const getAuthToken = req.headers["_auth_token"] as string;

            const result = await purchaseService.createPurchase(reqBody, getAuthToken);
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: "Failed to create purchase",
                error: (error as Error).message,
            });
        }
    }

    async getPurchaseById(req: Request, res: Response) {
        try {
            const { businessId, id } = req.params;
            const result = await purchaseService.getPurchaseById(parseInt(businessId), parseInt(id));
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: "Failed to get purchase by ID",
                error: (error as Error).message,
            });
        }
    }

    async updatePurchase(req: Request, res: Response) {
        try {
            const { businessId, id } = req.params;
            const updateData = req.body;
            const result = await purchaseService.updatePurchase({
                businessId: parseInt(businessId),
                id: parseInt(id),
                updateData,
            });
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: "Failed to update purchase",
                error: (error as Error).message,
            });
        }
    }

    async getPurchasesByBusiness(req: Request, res: Response) {
        try {
            const { businessId } = req.params;
            const result = await purchaseService.getPurchasesByBusiness(parseInt(businessId));
            res.status(200).json(result);
        } catch (error) {
            res.status(400).json({
                success: false,
                message: "Failed to get purchases by business",
                error: (error as Error).message,
            });
        }
    }
}

export default new PurchaseController();
