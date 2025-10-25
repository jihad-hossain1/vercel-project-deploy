"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const employee_service_1 = __importDefault(require("../service/employee.service"));
class EmployeeController {
    async createEmployee(req, res) {
        try {
            const json_data = req.body;
            const newEmployee = await employee_service_1.default.createEmployee(json_data);
            res.status(201).json(newEmployee);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getEmployeeById(req, res) {
        try {
            const { id } = req.params;
            const { businessId } = req.query;
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "businessId is required",
                });
            }
            const employee = await employee_service_1.default.getEmployeeById({
                id: Number(id),
                businessId: Number(businessId),
            });
            return res.status(200).json(employee);
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getEmployeesByBusiness(req, res) {
        try {
            const { limit = 10, offset = 0, query = "", page = 1, businessId, } = req.query;
            if (!businessId) {
                return res.status(400).json({
                    success: false,
                    message: "businessId is required",
                });
            }
            const employees = await employee_service_1.default.getEmployeesByBusiness({
                businessId: Number(businessId),
                limit: Number(limit),
                offset: Number(offset),
                query: query,
                page: Number(page),
            });
            return res.status(200).json(employees);
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async updateEmployee(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;
            delete updateData.id;
            delete updateData.createdAt;
            const updatedEmployee = await employee_service_1.default.updateEmployee(Number(id), updateData);
            res.status(200).json(updatedEmployee);
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.default = new EmployeeController();
//# sourceMappingURL=employee.controller.js.map