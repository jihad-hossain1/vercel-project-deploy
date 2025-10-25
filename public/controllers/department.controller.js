"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const department_service_1 = __importDefault(require("../service/department.service"));
class DepartmentController {
    async create(req, res) {
        const json_data = req.body;
        try {
            const response = await department_service_1.default.create(json_data);
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
        const { id } = req.params;
        try {
            const response = await department_service_1.default.update(Number(id), json_data);
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
            const response = await department_service_1.default.get({
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
    async getById(req, res) {
        const { id } = req.params;
        try {
            const response = await department_service_1.default.getById(Number(id));
            res.status(200).json(response);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async delete(req, res) {
        const { id } = req.params;
        try {
            const response = await department_service_1.default.delete(id);
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
exports.default = new DepartmentController();
//# sourceMappingURL=department.controller.js.map