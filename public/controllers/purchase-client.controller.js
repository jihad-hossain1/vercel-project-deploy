"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const purchase_client_service_1 = __importDefault(require("../service/purchase-client.service"));
class PurchaseClientController {
    async createPurchaseClient(req, res) {
        const reqBody = req.body;
        try {
            const result = await purchase_client_service_1.default.createPurchaseClient(reqBody);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });
        }
    }
    async getBusinessPurchaseClient(req, res) {
        try {
            const { id, businessId } = req.params;
            const client = await purchase_client_service_1.default.getBusinessPurchaseClient({
                id: Number(id),
                businessId: Number(businessId),
            });
            res.status(200).json(client);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });
        }
    }
    async getPurchaseClientsByBusiness(req, res) {
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
            query: query,
        };
        try {
            const result = await purchase_client_service_1.default.getPurchaseClientsByBusiness(Number(businessId), options);
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });
        }
    }
    async updatePurchaseClient(req, res) {
        try {
            const { id, businessId } = req.params;
            const updateData = req.body;
            delete updateData.id;
            delete updateData.createdAt;
            delete updateData.updatedAt;
            const updatedClient = await purchase_client_service_1.default.updatePurchaseClient({
                id: Number(id),
                updateData: {
                    ...updateData,
                },
                businessId: parseInt(businessId),
            });
            res.status(200).json(updatedClient);
        }
        catch (error) {
            console.error("Error updating purchase client:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });
        }
    }
    async archivePurchaseClient(req, res) {
        try {
            const { id, businessId } = req.params;
            const { isActive } = req.body;
            const result = await purchase_client_service_1.default.archivePurchaseClient({
                businessId: Number(businessId),
                id: Number(id),
                isActive,
            });
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });
        }
    }
    async searchClients(req, res) {
        const { businessId } = req.params;
        const { searchTerm = "", limit = 10 } = req.query;
        try {
            const response = await purchase_client_service_1.default.searchClients({
                businessId: Number(businessId),
                limit: Number(limit),
                searchTerm: searchTerm,
            });
            res.status(200).json(response);
        }
        catch (error) {
            res
                .status(500)
                .json({
                success: false,
                message: "Internal server error",
                error: error.message,
            });
        }
    }
}
exports.default = new PurchaseClientController();
//# sourceMappingURL=purchase-client.controller.js.map