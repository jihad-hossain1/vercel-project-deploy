"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dashboard_service_1 = __importDefault(require("../service/dashboard.service"));
class DashboardController {
    async getDashboardStats(req, res) {
        try {
            const { businessId } = req.query;
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "businessId is required",
                });
            }
            const dashboardStats = await dashboard_service_1.default.getDashboardStats(Number(businessId));
            return res.status(200).json(dashboardStats);
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.default = new DashboardController();
//# sourceMappingURL=dashboard.controller.js.map