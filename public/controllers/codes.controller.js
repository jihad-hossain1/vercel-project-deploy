"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const codes_service_1 = __importDefault(require("../service/codes.service"));
class CodesController {
    async create(req, res) {
        const json_data = req.body;
        try {
            const response = await codes_service_1.default.create(json_data);
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async update(req, res) {
        const json_data = req.body;
        const { codeId } = req.params;
        try {
            const response = await codes_service_1.default.update(Number(codeId), json_data);
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async get(req, res) {
        const reqQuery = req.query;
        try {
            const response = await codes_service_1.default.get({
                ...reqQuery,
                businessId: Number(reqQuery?.businessId),
                page: Number(reqQuery?.page),
                limit: Number(reqQuery?.limit),
            });
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async archive(req, res) {
        const { id, businessId } = req.params;
        const { isActive } = req.body;
        try {
            const response = await codes_service_1.default.archive({
                businessId: Number(businessId),
                id: Number(id),
                isActive,
            });
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async searchCodes(req, res) {
        const { businessId } = req.params;
        const { limit = 10, searchTerm = "" } = req.query;
        try {
            const response = await codes_service_1.default.search({
                businessId: Number(businessId),
                limit: Number(limit),
                searchTerm,
            });
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.default = new CodesController();
//# sourceMappingURL=codes.controller.js.map