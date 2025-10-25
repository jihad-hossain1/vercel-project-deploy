"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const validate_1 = require("../helpers/validate");
const log_service_1 = __importDefault(require("./log.service"));
const auto_code_generate_service_1 = __importDefault(require("./auto-code-generate.service"));
const dashboard_service_1 = __importDefault(require("./dashboard.service"));
class EmployeeService {
    async createEmployee(employeeData) {
        const safeParse = validate_1.employeeSchema.safeParse(employeeData);
        if (!safeParse.success) {
            return { success: false, error: safeParse.error.flatten() };
        }
        const { businessId, email, departmentName, hireDate, password, userName, departmentId, mobile, rolePermission, } = safeParse.data;
        try {
            const gen_code = await auto_code_generate_service_1.default.emp_gen({ businessId: businessId });
            await prisma_1.default.employees.create({
                data: {
                    empCode: gen_code,
                    businessId: Number(businessId),
                    email,
                    departmentName,
                    hireDate: new Date(hireDate).toISOString(),
                    password,
                    userName,
                    departmentId: Number(departmentId),
                    mobile,
                    rolePermission,
                },
            });
            await dashboard_service_1.default.updateDashboardStats({
                businessId,
                stats: {
                    employees: 1,
                },
            });
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "employee-service",
                message: "employee create failed",
                details: `${error?.message}`,
                context: { businessId: businessId },
            });
            return {
                success: false,
                error: `Failed to create employee: ${error.message}`,
            };
        }
    }
    async getEmployeeById({ id, businessId }) {
        try {
            const employee = await prisma_1.default.employees.findFirst({
                where: {
                    id: Number(id),
                    businessId: Number(businessId),
                },
            });
            return {
                success: true,
                data: employee,
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "employee-service",
                message: "get employee failed",
                details: error.message,
                context: { businessId },
            });
            return {
                success: false,
                error: `Failed to get customer: ${error.message}`,
            };
        }
    }
    async getEmployeesByBusiness(props) {
        const { businessId, page = 1, limit = 10, offset = 0, query = "" } = props;
        if (!businessId ||
            isNaN(businessId) ||
            !Number.isInteger(Number(businessId)) ||
            Number(businessId) <= 0)
            return {
                error: "Business Id must be a valid positive integer",
                success: false,
            };
        const calculatedOffset = Number(offset) || (Number(page) - 1) * Number(limit);
        const whereConditions = {
            businessId: Number(businessId),
        };
        if (query && query.trim() !== "") {
            whereConditions.OR = {
                empCode: { contains: query.trim(), mode: "insensitive" },
                userName: { contains: query.trim(), mode: "insensitive" },
                email: { contains: query.trim(), mode: "insensitive" },
            };
        }
        try {
            const businessEmployees = await prisma_1.default.employees.findMany({
                where: whereConditions,
                take: Number(limit),
                skip: calculatedOffset,
                orderBy: { createdAt: "desc" },
            });
            const totalCount = await prisma_1.default.employees.count({
                where: whereConditions,
            });
            const totalPages = Math.ceil(totalCount / Number(limit));
            return {
                success: true,
                data: businessEmployees,
                pagination: {
                    page: Number(page),
                    limit: Number(limit),
                    totalPages,
                    totalCount,
                },
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "employee-service",
                message: "get employee failed",
                details: error.message,
                context: { businessId },
            });
            return { error: error?.message, success: false };
        }
    }
    async updateEmployee(id, updateData) {
        try {
            await prisma_1.default.employees.update({
                where: { id: Number(id) },
                data: { ...updateData, updatedAt: new Date() },
            });
            return {
                success: true,
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "employee-service",
                message: "update employee failed",
                details: error.message,
                context: { id },
            });
            return {
                success: false,
                error: `Failed to update employee: ${error.message}`,
            };
        }
    }
}
exports.default = new EmployeeService();
//# sourceMappingURL=employee.service.js.map