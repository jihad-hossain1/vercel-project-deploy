"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../helpers/validate");
const prisma_1 = __importDefault(require("../lib/prisma"));
const log_service_1 = __importDefault(require("./log.service"));
const auto_code_generate_service_1 = __importDefault(require("./auto-code-generate.service"));
class DepartmentService {
    async create(requireData) {
        const safeParse = validate_1.departmentSchema.safeParse(requireData);
        if (!safeParse.success)
            return {
                success: false,
                error: "Fields are missing",
                errors: safeParse?.error?.flatten(),
            };
        const { name, businessId } = safeParse.data;
        try {
            const findDepartment = await prisma_1.default.departments.findMany({
                where: {
                    businessId: Number(businessId),
                    name: {
                        contains: name,
                    },
                },
            });
            if (findDepartment.length > 0) {
                return {
                    success: false,
                    error: "Department name already exists for this business",
                };
            }
            const gen_dept_code = await auto_code_generate_service_1.default.dept_gen({
                businessId,
            });
            const newDepartment = await prisma_1.default.departments.create({
                data: {
                    name,
                    deptCode: gen_dept_code,
                    businessId: Number(businessId),
                },
            });
            return { success: true, data: newDepartment };
        }
        catch (error) {
            log_service_1.default.error({
                source: "department-service",
                message: "Department create failed",
                details: `${error?.message}`,
                context: { businessId },
            });
            return { success: false, error: error?.message };
        }
    }
    async update(id, updateData) {
        const safeParse = validate_1.departmentSchema.partial().safeParse(updateData);
        if (!safeParse.success)
            return {
                success: false,
                error: "Invalid data",
                errors: safeParse?.error?.flatten(),
            };
        try {
            const existingDept = await prisma_1.default.departments.findMany({
                where: {
                    id: Number(id),
                },
            });
            if (existingDept.length === 0) {
                return { success: false, error: "Department not found" };
            }
            if (updateData.deptCode &&
                updateData.deptCode !== existingDept[0].deptCode) {
                const findExistingCode = await prisma_1.default.departments.findMany({
                    where: {
                        businessId: Number(existingDept[0].businessId),
                        deptCode: updateData.deptCode,
                        id: {
                            not: Number(id),
                        },
                    },
                });
                if (findExistingCode.length > 0) {
                    return {
                        success: false,
                        error: "Department code already exists for this business",
                    };
                }
            }
            const updatedDept = await prisma_1.default.departments.update({
                where: {
                    id: Number(id),
                },
                data: safeParse.data,
            });
            return { success: true, data: updatedDept };
        }
        catch (error) {
            log_service_1.default.error({
                source: "department-service",
                message: "Department update failed",
                details: `${error?.message}`,
                context: { id },
            });
            return { success: false, error: error?.message };
        }
    }
    async get(props) {
        const { businessId, page = 1, limit = 10, offset = 0, query = "" } = props;
        if (!businessId ||
            isNaN(businessId) ||
            !Number.isInteger(Number(businessId)) ||
            Number(businessId) <= 0) {
            return {
                error: "Business ID must be a valid positive integer",
                success: false,
            };
        }
        try {
            const calculatedOffset = Number(offset) || (Number(page) - 1) * Number(limit);
            const whereConditions = {
                businessId: Number(businessId),
            };
            if (query && query.trim() !== "") {
                whereConditions.name = {
                    contains: query.trim(),
                };
            }
            const businessDepts = await prisma_1.default.departments.findMany({
                where: whereConditions,
                skip: calculatedOffset,
                take: Number(limit),
                orderBy: {
                    createdAt: "desc",
                },
            });
            const totalCount = await prisma_1.default.departments.count({
                where: whereConditions,
            });
            const totalPages = Math.ceil(totalCount / Number(limit));
            return {
                success: true,
                data: businessDepts,
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
                source: "department-service",
                message: "Get departments failed",
                details: `${error?.message}`,
                context: { businessId },
            });
            return { success: false, error: error?.message };
        }
    }
    async getById(id) {
        try {
            const department = await prisma_1.default.departments.findMany({
                where: { id: Number(id) },
            });
            if (department.length === 0) {
                return { success: false, error: "Department not found" };
            }
            return { success: true, data: department[0] };
        }
        catch (error) {
            log_service_1.default.error({
                source: "department-service",
                message: "Get department by ID failed",
                details: `${error?.message}`,
                context: { id },
            });
            return { success: false, error: error?.message };
        }
    }
    async delete(id) {
        try {
            const existingDept = await prisma_1.default.departments.findMany({
                where: { id: Number(id) },
            });
            if (existingDept.length === 0) {
                return { success: false, error: "Department not found" };
            }
            await prisma_1.default.departments.delete({ where: { id: Number(id) } });
            return { success: true, message: "Department deleted successfully" };
        }
        catch (error) {
            log_service_1.default.error({
                source: "department-service",
                message: "Department delete failed",
                details: `${error?.message}`,
                context: { id },
            });
            return { success: false, error: error?.message };
        }
    }
}
exports.default = new DepartmentService();
//# sourceMappingURL=department.service.js.map