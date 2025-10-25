"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const log_service_1 = __importDefault(require("./log.service"));
class BusinessService {
    async getBusinessStats(businessId) {
        try {
            const businessInfo = await prisma_1.default.business.findUnique({
                where: { id: Number(businessId) },
            });
            if (!businessInfo) {
                return null;
            }
            const customerCount = await prisma_1.default.customers.count({
                where: { businessId: Number(businessId) },
            });
            const itemCount = await prisma_1.default.items.count({
                where: { businessId: Number(businessId) },
            });
            const invoiceCount = await prisma_1.default.invoice_master.count({
                where: { businessId: Number(businessId) },
            });
            const revenueResult = await prisma_1.default.invoice_master.aggregate({
                where: {
                    businessId: Number(businessId),
                    status: "paid",
                },
                _sum: {
                    totalAmount: true,
                },
            });
            return {
                business: businessInfo,
                stats: {
                    customerCount,
                    itemCount,
                    invoiceCount,
                    totalRevenue: Number(revenueResult._sum.totalAmount) || 0,
                },
            };
        }
        catch (error) {
            throw new Error(`Failed to get business stats: ${error.message}`);
        }
    }
    async update(businessId, isStockManaged) {
        try {
            await prisma_1.default.business.update({
                where: { id: Number(businessId) },
                data: {
                    isStockManaged,
                },
            });
            return { success: true, message: "Business updated successfully" };
        }
        catch (error) {
            log_service_1.default.error({
                message: `Failed to update business: ${error.message}`,
                context: "BusinessService.update",
                path: "b2c_backend/src/service/business.service.ts",
            });
            return { success: false, message: error.message };
        }
    }
}
exports.default = new BusinessService();
//# sourceMappingURL=business.service.js.map