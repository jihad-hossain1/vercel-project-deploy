"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customer_service_1 = __importDefault(require("../service/customer.service"));
class CustomerController {
    async createCustomer(req, res) {
        try {
            const json_data = req.body;
            const newCustomer = await customer_service_1.default.createCustomer(json_data);
            res.status(201).json(newCustomer);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getCustomerById(req, res) {
        try {
            const { customerId, businessId } = req.query;
            if (!customerId || !businessId) {
                return res.status(400).json({
                    success: false,
                    message: "customerId and businessId are required",
                });
            }
            const customer = await customer_service_1.default.getCustomerById({
                customerId: Number(customerId),
                businessId: Number(businessId),
            });
            return res.status(200).json(customer);
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getCustomersByBusiness(req, res) {
        try {
            const { businessId } = req.params;
            const { limit = 10, offset = 0, query = "", page = 1 } = req.query;
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "businessId is required",
                });
            }
            const customers = await customer_service_1.default.getCustomersByBusiness({
                businessId: Number(businessId),
                limit: Number(limit),
                offset: Number(offset),
                query: String(query),
                page: Number(page),
            });
            return res.status(200).json(customers);
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async updateCustomer(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            delete updateData.id;
            delete updateData.createdAt;
            const updatedCustomer = await customer_service_1.default.updateCustomer(Number(id), updateData);
            res.status(200).json(updatedCustomer);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async deleteCustomer(req, res) {
        try {
            const { id } = req.params;
            await customer_service_1.default.deleteCustomer(parseInt(id));
            res.status(200).json({
                success: true,
                message: "Customer deleted successfully",
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async searchCustomers(req, res) {
        try {
            const { businessId } = req.params;
            const { searchTerm = "", limit = 10 } = req.query;
            const customers = await customer_service_1.default.searchCustomers({
                businessId: parseInt(businessId),
                searchTerm,
                limit: Number(limit),
            });
            res.status(200).json(customers);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async archiveCustomer(req, res) {
        try {
            const { businessId, customerId } = req.params;
            const { isActive } = req.body;
            const result = await customer_service_1.default.archiveCustomer({
                businessId: Number(businessId),
                customerId: Number(customerId),
                isActive,
            });
            res.status(200).json(result);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async customerSalesAnalytics(req, res) {
        try {
            const { businessId, customerId } = req.params;
            const { limit = 10, offset = 0, page = 1 } = req.query;
            const analytics = await customer_service_1.default.customerSalesAnalytics({
                businessId: parseInt(businessId),
                customerId: parseInt(customerId),
                limit: Number(limit),
                offset: Number(offset),
                page: Number(page),
            });
            res.status(200).json(analytics);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.default = new CustomerController();
//# sourceMappingURL=customer.controller.js.map