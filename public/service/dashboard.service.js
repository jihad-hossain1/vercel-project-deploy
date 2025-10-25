"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const log_service_1 = __importDefault(require("./log.service"));
class DashboardService {
    async getDashboardStats(businessId) {
        try {
            const stats = await prisma_1.default.business_stats.findUnique({
                where: { businessId: Number(businessId) },
            });
            return {
                success: true,
                data: stats,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get dashboard stats: ${error?.message}`,
            };
        }
    }
    async updateDashboardStats(props) {
        const { businessId, stats } = props;
        const { customers = 0, items = 0, employees = 0, invoices = 0, suppliers = 0, purchases = 0, } = stats;
        try {
            const previousStats = await prisma_1.default.business_stats.findUnique({
                where: { businessId: parseInt(businessId) },
            });
            if (!previousStats) {
                await prisma_1.default.business_stats.create({
                    data: {
                        businessId: parseInt(businessId),
                        customers,
                        items,
                        employees,
                        invoices,
                        suppliers,
                        purchases,
                    },
                });
                return { success: true };
            }
            const updateData = {};
            if (customers > 0)
                updateData.customers = previousStats.customers + customers;
            if (items > 0)
                updateData.items = previousStats.items + items;
            if (employees > 0)
                updateData.employees = previousStats.employees + employees;
            if (invoices > 0)
                updateData.invoices = previousStats.invoices + invoices;
            if (suppliers > 0)
                updateData.suppliers = previousStats.suppliers + suppliers;
            if (purchases > 0)
                updateData.purchases = previousStats.purchases + purchases;
            if (Object.keys(updateData).length > 0) {
                await prisma_1.default.business_stats.update({
                    where: { businessId: parseInt(businessId) },
                    data: updateData,
                });
            }
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "dashboard-service",
                message: "update dashboard stats failed",
                details: `${error?.message}`,
                context: { businessId },
            });
            return {
                success: false,
                error: `Failed to update dashboard stats: ${error.message}`,
            };
        }
    }
}
exports.default = new DashboardService();
//# sourceMappingURL=dashboard.service.js.map