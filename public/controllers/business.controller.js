"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const business_service_1 = __importDefault(require("../service/business.service"));
class BusinessController {
    async update(req, res) {
        const { businessId, isStockManaged } = req.body;
        try {
            const response = await business_service_1.default.update(businessId, isStockManaged);
            res.status(200).json(response);
        }
        catch (error) {
            res
                .status(500)
                .json({ success: false, message: error.message });
        }
    }
}
exports.default = new BusinessController();
//# sourceMappingURL=business.controller.js.map