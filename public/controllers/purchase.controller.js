"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const purchase_service_1 = __importDefault(require("../service/purchase.service"));
class PurchaseController {
    async createPurchase(req, res) {
        const reqBody = req.body;
        try {
            const getAuthToken = req.headers["_auth_token"];
            const result = await purchase_service_1.default.createPurchase(reqBody, getAuthToken);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: "Failed to create purchase",
                error: error.message,
            });
        }
    }
    async getPurchaseById(req, res) {
        try {
            const { businessId, id } = req.params;
            const result = await purchase_service_1.default.getPurchaseById(parseInt(businessId), parseInt(id));
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: "Failed to get purchase by ID",
                error: error.message,
            });
        }
    }
    async updatePurchase(req, res) {
        try {
            const { businessId, id } = req.params;
            const updateData = req.body;
            const result = await purchase_service_1.default.updatePurchase({
                businessId: parseInt(businessId),
                id: parseInt(id),
                updateData,
            });
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: "Failed to update purchase",
                error: error.message,
            });
        }
    }
    async getPurchasesByBusiness(req, res) {
        try {
            const { businessId } = req.params;
            const result = await purchase_service_1.default.getPurchasesByBusiness(parseInt(businessId));
            res.status(200).json(result);
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: "Failed to get purchases by business",
                error: error.message,
            });
        }
    }
}
exports.default = new PurchaseController();
//# sourceMappingURL=purchase.controller.js.map