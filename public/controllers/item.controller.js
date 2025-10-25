"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const item_service_1 = __importDefault(require("../service/item.service"));
class ItemController {
    async createItem(req, res) {
        try {
            const jsonData = req.body;
            const newItem = await item_service_1.default.createItem(jsonData);
            res.status(201).json(newItem);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getItemById(req, res) {
        try {
            const { itemId, businessId } = req.query;
            if (!itemId || !businessId) {
                return res.status(400).json({
                    success: false,
                    message: "itemId and businessId are required",
                });
            }
            const item = await item_service_1.default.getItemById({
                businessId: Number(businessId),
                itemId: Number(itemId),
            });
            res.status(200).json(item);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getItemsByBusiness(req, res) {
        try {
            const { businessId } = req.params;
            const reqQuery = req.query;
            const items = await item_service_1.default.getItemsByBusiness({
                ...reqQuery,
                businessId: Number(businessId),
                limit: Number(reqQuery?.limit),
            });
            res.status(200).json(items);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async updateItem(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            delete updateData.id;
            delete updateData.createdAt;
            const updatedItem = await item_service_1.default.updateItem({
                businessId: Number(updateData.businessId),
                itemId: Number(id),
                updateData,
            });
            res.status(200).json(updatedItem);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async archiveItem(req, res) {
        try {
            const { itemId, businessId } = req.params;
            const { isActive } = req.body;
            const archiveResponse = await item_service_1.default.archiveItem({
                businessId: Number(businessId),
                itemId: Number(itemId),
                isActive,
            });
            res.status(200).json(archiveResponse);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async deleteItem(req, res) {
        try {
            const { itemId, businessId } = req.params;
            await item_service_1.default.deleteItem({
                businessId: Number(businessId),
                itemId: Number(itemId),
            });
            res.status(200).json({
                success: true,
                message: "Item deleted successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async searchItems(req, res) {
        try {
            const { businessId } = req.params;
            const { searchTerm = "", limit = 10 } = req.query;
            const items = await item_service_1.default.searchItems({
                searchTerm: searchTerm,
                businessId: Number(businessId),
                limit: Number(limit),
            });
            res.status(200).json(items);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async itemAnalysis(req, res) {
        try {
            const { businessId } = req.params;
            const { searchTerm = "", limit = 10, fromDate = "", toDate = "", } = req.query;
            const itemAnalysis = await item_service_1.default.itemAnalysis({
                businessId: Number(businessId),
                limit: Number(limit),
                searchTerm: searchTerm,
                fromDate: fromDate,
                toDate: toDate,
            });
            res.status(200).json(itemAnalysis);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async itemSalesHistory(req, res) {
        try {
            const { businessId, itemId } = req.params;
            const { limit, fromDate = "", toDate = "", searchTerm = "", page, } = req.query;
            const itemSalesHistory = await item_service_1.default.itemSalesHistory({
                businessId: Number(businessId),
                itemId: Number(itemId),
                limit: Number(limit),
                fromDate: fromDate,
                toDate: toDate,
                searchTerm: searchTerm,
                page: Number(page),
            });
            res.status(200).json(itemSalesHistory);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.default = new ItemController();
//# sourceMappingURL=item.controller.js.map