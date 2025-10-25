"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const validate_1 = require("../helpers/validate");
const log_service_1 = __importDefault(require("./log.service"));
const dashboard_service_1 = __importDefault(require("./dashboard.service"));
const zod_1 = require("zod");
const UpdatePurchaseClient = zod_1.z.object({
    id: zod_1.z.number().int(),
    businessId: zod_1.z.number().int(),
    updateData: validate_1.purchaseClientSchema.omit({
        id: true,
        businessId: true,
    }),
});
class PurchaseClientService {
    async createPurchaseClient(clientData) {
        const { email, businessId } = clientData;
        const safeParse = validate_1.purchaseClientSchema.safeParse(clientData);
        if (!safeParse.success) {
            return {
                success: false,
                error: safeParse.error.message,
            };
        }
        try {
            const parseData = safeParse.data;
            const existingClient = await prisma_1.default.purchase_client.findFirst({
                where: {
                    email,
                    businessId: Number(businessId),
                },
            });
            if (existingClient) {
                return {
                    success: false,
                    error: "Purchase client with this email already exists for this business",
                    client_exist: true,
                };
            }
            const clientDataToCreate = {
                ...parseData,
                businessId: Number(businessId),
            };
            await prisma_1.default.purchase_client.create({ data: clientDataToCreate });
            await dashboard_service_1.default.updateDashboardStats({
                businessId,
                stats: {
                    suppliers: 1,
                },
            });
            return {
                success: true,
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "purchase client service",
                message: "purchase client create failed",
                details: error instanceof Error ? error.message : "Unknown error",
                context: { email, businessId },
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async getPurchaseClientsByBusiness(businessId, options = {}) {
        const { page = 1, limit = 10, offset = 0, query = "" } = options;
        if (!businessId ||
            isNaN(businessId) ||
            !Number.isInteger(Number(businessId)) ||
            Number(businessId) <= 0) {
            return {
                error: "Business Id must be a valid positive integer",
                success: false,
            };
        }
        const calculatedOffset = Number(offset) || (Number(page) - 1) * Number(limit);
        try {
            const where = {
                businessId: Number(businessId),
                name: query && query.trim() !== ""
                    ? { contains: query.trim(), mode: "insensitive" }
                    : undefined,
            };
            const [clients, totalCount] = await prisma_1.default.$transaction([
                prisma_1.default.purchase_client.findMany({
                    where,
                    take: Number(limit),
                    skip: calculatedOffset,
                    orderBy: { id: "desc" },
                }),
                prisma_1.default.purchase_client.count({ where }),
            ]);
            const totalPages = Math.ceil(totalCount / Number(limit));
            return {
                success: true,
                data: clients,
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
                source: "purchase-client-service",
                message: "get purchase client failed",
                details: error instanceof Error ? error.message : "Unknown error",
                context: { businessId },
            });
            return {
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
            };
        }
    }
    async getBusinessPurchaseClient(props) {
        const { id, businessId } = props;
        try {
            const client = await prisma_1.default.purchase_client.findFirst({
                where: { id: Number(id), businessId: Number(businessId) },
            });
            if (!client) {
                return {
                    success: false,
                    error: "Purchase client not found",
                };
            }
            return {
                success: true,
                data: client,
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "purchase client service",
                message: "purchase client get by id failed",
                details: error instanceof Error ? error.message : "Unknown error",
                context: { id, businessId },
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async updatePurchaseClient(props) {
        const validateSchema = UpdatePurchaseClient.safeParse(props);
        if (!validateSchema.success)
            return {
                success: false,
                error: "Required are missing",
                errors: validateSchema.error.flatten(),
            };
        const { id, businessId, updateData } = validateSchema.data;
        try {
            await prisma_1.default.purchase_client.updateMany({
                where: { id: Number(id), businessId: Number(businessId) },
                data: { ...updateData, updatedAt: new Date() },
            });
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "purchase-client-service",
                message: "update purchase client failed",
                details: error instanceof Error ? error.message : "Unknown error",
                context: { id, businessId },
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async archivePurchaseClient(props) {
        const validateSchema = validate_1.ArchiveSchema.safeParse(props);
        if (!validateSchema.success)
            return {
                success: false,
                error: "Required are missing",
                errors: validateSchema.error.flatten(),
            };
        const { businessId, id, isActive } = validateSchema.data;
        try {
            await prisma_1.default.purchase_client.updateMany({
                where: { id: Number(id), businessId: Number(businessId) },
                data: { isActive, updatedAt: new Date() },
            });
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "purchase-client-service",
                message: "archive purchase client failed",
                details: error instanceof Error ? error.message : "Unknown error",
                context: { businessId, id },
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
    async searchClients(props) {
        const safeParse = validate_1.SearchSchema.safeParse(props);
        if (!safeParse.success) {
            return { success: false, error: safeParse.error.flatten() };
        }
        const { businessId, searchTerm, limit } = safeParse.data;
        try {
            const data = await prisma_1.default.purchase_client.findMany({
                where: {
                    businessId: Number(businessId),
                    isActive: true,
                    OR: [
                        { name: { contains: searchTerm } },
                        { email: { contains: searchTerm } },
                        { phone: { contains: searchTerm } },
                    ],
                },
                take: Number(limit),
                orderBy: { createdAt: "desc" },
            });
            return { success: true, data };
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }
}
exports.default = new PurchaseClientService();
//# sourceMappingURL=purchase-client.service.js.map