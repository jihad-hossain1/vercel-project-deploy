"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const validate_1 = require("../helpers/validate");
const zod_1 = require("zod");
const prisma_2 = require("../../generated/prisma");
const log_service_1 = __importDefault(require("./log.service"));
const dashboard_service_1 = __importDefault(require("./dashboard.service"));
const auto_code_generate_service_1 = __importDefault(require("./auto-code-generate.service"));
const ArchiveSchema = zod_1.z.object({
    businessId: zod_1.z.number().int("businessId must be an integer"),
    itemId: zod_1.z.number().int("itemId must be an integer"),
    isActive: zod_1.z.boolean(),
});
class ItemService {
    async createItem(itemData) {
        const validatedItemData = validate_1.itemSchema.safeParse(itemData);
        if (!validatedItemData?.success)
            return {
                success: false,
                errors: validatedItemData?.error?.format(),
                error: "validation failed",
            };
        try {
            const { name, category, unitPrice, stockQuantity, minStockLevel, businessId, costPrice, description, catId, unit, taxRate, discountRate, } = validatedItemData.data;
            const item_gen = await auto_code_generate_service_1.default.item_gen({ businessId: businessId });
            await prisma_1.default.items.create({
                data: {
                    name,
                    category,
                    proCode: item_gen,
                    unitPrice,
                    stockQuantity,
                    minStockLevel,
                    costPrice,
                    businessId: Number(businessId),
                    description,
                    catId: Number(catId),
                    unit,
                    taxRate,
                    createdAt: new Date(),
                    discountRate,
                    sku: item_gen,
                },
            });
            await dashboard_service_1.default.updateDashboardStats({
                businessId,
                stats: {
                    items: 1,
                },
            });
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "item-service",
                message: "create item failed",
                details: error.message,
                context: { error },
            });
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async getItemsByBusiness(props) {
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
        const sanitizedQuery = `%${query}%`;
        try {
            const items = (await prisma_1.default.$queryRaw `
            select *
            from items 
            where businessId = ${Number(businessId)}
            and (name like ${sanitizedQuery} or proCode like ${sanitizedQuery})
            order by createdAt desc
            limit ${Number(limit)}
            offset ${calculatedOffset}
            `);
            const itemIds = items.map((item) => item.id);
            const stockCount = (await prisma_1.default.$queryRaw `
            select itemId, sum(qty) as totalStock
            from stock_movements
            where itemId in (${prisma_2.Prisma.join(itemIds)})
            group by itemId
            `);
            const totalCount = (await prisma_1.default.$queryRaw `
            select count(*) as totalCount from items
            where businessId = ${Number(businessId)}
            and (name like ${sanitizedQuery} or proCode like ${sanitizedQuery})
            `);
            const totalPages = Math.ceil(Number(totalCount[0].totalCount) / Number(limit));
            return {
                success: true,
                data: items.map((item) => ({
                    ...item,
                    totalStock: stockCount.find((count) => count.itemId === item.id)?.totalStock || 0,
                })),
                pagination: {
                    totalPages,
                },
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "item-service",
                message: "get items failed",
                details: error.message,
                context: { businessId },
            });
            return { error: error?.message, success: false };
        }
    }
    async getItemById(props) {
        try {
            const { itemId, businessId } = props;
            const item = await prisma_1.default.items.findFirst({
                where: { id: Number(itemId), businessId: Number(businessId) },
            });
            return {
                success: true,
                data: item,
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "item-service",
                message: "get item failed",
                details: error.message,
                context: { error },
            });
            return { error: error?.message, success: false };
        }
    }
    async updateItem(props) {
        try {
            const { itemId, businessId, updateData } = props;
            await prisma_1.default.items.update({
                where: { id: Number(itemId), businessId: Number(businessId) },
                data: { ...updateData, updatedAt: new Date() },
            });
            return {
                success: true,
                message: "Item updated successfully",
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "item-service",
                message: "update item failed",
                details: error.message,
                context: { error },
            });
            return {
                success: false,
                message: error.message,
            };
        }
    }
    async archiveItem(props) {
        const validateSchema = ArchiveSchema.safeParse(props);
        if (!validateSchema.success)
            return {
                success: false,
                error: "Required are missing",
                errors: validateSchema.error.flatten(),
            };
        const { businessId, itemId, isActive } = validateSchema.data;
        try {
            await prisma_1.default.items.update({
                where: { id: Number(itemId), businessId: Number(businessId) },
                data: { isActive, updatedAt: new Date() },
            });
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "item-service",
                message: "archive item failed",
                details: error.message,
                context: { businessId },
            });
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async deleteItem(props) {
        try {
            const { businessId, itemId } = props;
            const deletedItem = await prisma_1.default.items.update({
                where: { id: Number(itemId), businessId: Number(businessId) },
                data: { isActive: false, updatedAt: new Date() },
            });
            return { success: true, message: "Item deleted successfully" };
        }
        catch (error) {
            log_service_1.default.error({
                source: "item-service",
                message: "delete item failed",
                details: error.message,
                context: { error },
            });
            return {
                success: false,
                error: error.message,
            };
        }
    }
    async searchItems(props) {
        const safeParse = validate_1.SearchSchema.safeParse(props);
        if (!safeParse.success) {
            return { success: false, error: safeParse.error.flatten() };
        }
        const { businessId, searchTerm, limit } = safeParse.data;
        try {
            const data = await prisma_1.default.items.findMany({
                where: {
                    businessId: Number(businessId),
                    isActive: true,
                    OR: [
                        { name: { contains: searchTerm } },
                        { proCode: { contains: searchTerm } },
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
                error: `Failed to search items: ${error.message}`,
            };
        }
    }
    async itemAnalysis(props) {
        const { businessId, searchTerm = "", page = 1, limit = 10, fromDate, toDate, } = props;
        const offset = (Number(page || 1) - 1) * limit;
        const sanitizedSearchTerm = `%${searchTerm}%`;
        try {
            const productAnalytics = await prisma_1.default.$queryRaw `
              SELECT i.id AS item_id,
                      i.name AS item_name,
                      SUM(CAST(d.quantity AS DECIMAL(10, 2))) AS total_quantity_sold,
                      SUM(CAST(d.lineTotal AS DECIMAL(10, 2))) AS total_sales,
                      ROUND(
                        SUM((CAST(d.unitPrice AS DECIMAL(10, 2)) - CAST(i.costPrice AS DECIMAL(10, 2))) * CAST(d.quantity AS DECIMAL(10, 2)))
                      , 2) AS gross_profit,
                      ROUND(
                        (
                          SUM((CAST(d.unitPrice AS DECIMAL(10, 2)) - CAST(i.costPrice AS DECIMAL(10, 2))) * CAST(d.quantity AS DECIMAL(10, 2))) 
                          / NULLIF(SUM(CAST(d.lineTotal AS DECIMAL(10, 2))), 0)
                        ) * 100, 2
                      ) AS profit_margin
              FROM items i
              LEFT JOIN invoice_detail d ON d.itemId = i.id
              LEFT JOIN invoice_master m ON m.id = d.invoiceMasterId
              WHERE i.businessId = ${businessId}
                AND i.name LIKE ${sanitizedSearchTerm}
              ${fromDate && toDate
                ? prisma_2.Prisma.sql `AND d.createdAt BETWEEN ${new Date(new Date(fromDate).setUTCHours(0, 0, 0, 0))} AND ${new Date(new Date(toDate).setUTCHours(23, 59, 59, 999))}`
                : prisma_2.Prisma.sql ``}  
              GROUP BY i.id, i.name, i.stockQuantity
              ORDER BY total_sales DESC
              LIMIT ${limit} OFFSET ${offset};
              `;
            const itemIds = productAnalytics.map((item) => item.item_id);
            const stockCount = (await prisma_1.default.$queryRaw `
              select itemId, sum(qty) as totalStock
              from stock_movements
              where itemId in (${prisma_2.Prisma.join(itemIds)})
              group by itemId
              `);
            const totalCount = await prisma_1.default.$queryRaw `
              SELECT COUNT(DISTINCT i.id) AS total_count
              FROM items i
              LEFT JOIN invoice_detail d ON d.itemId = i.id
              LEFT JOIN invoice_master m ON m.id = d.invoiceMasterId
              WHERE i.businessId = ${businessId}
                AND i.name LIKE ${sanitizedSearchTerm}
                ${fromDate && toDate
                ? prisma_2.Prisma.sql `AND d.createdAt BETWEEN ${new Date(new Date(fromDate).setUTCHours(0, 0, 0, 0))} AND ${new Date(new Date(toDate).setUTCHours(23, 59, 59, 999))}`
                : prisma_2.Prisma.sql ``}
                ;
              `;
            const totalItems = Number(totalCount?.[0]?.total_count || 0);
            const totalPages = Math.ceil(totalItems / limit);
            return {
                success: true,
                data: {
                    data: productAnalytics.map((item) => ({
                        ...item,
                        current_stock: stockCount.find((count) => count.itemId == item.item_id)?.totalStock || 0,
                    })),
                    totalPages,
                },
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "item-service",
                message: "item analysis failed",
                details: error.message,
                context: { businessId },
            });
            return {
                success: false,
                message: "item analysis failed",
                errors: error.message,
            };
        }
    }
    async itemSalesHistory(props) {
        const { businessId, itemId, page = 1, limit = 10, fromDate, toDate, searchTerm = "", } = props;
        const offset = (Number(page || 1) - 1) * limit;
        const sanitizedSearchTerm = `%${searchTerm}%`;
        try {
            const histories = await prisma_1.default.$queryRaw `
        select d.*, m.invoiceNumber from invoice_detail d
        left join invoice_master m on m.id = d.invoiceMasterId
        WHERE 
          d.businessId = ${Number(businessId)}
          AND d.itemId = ${Number(itemId)}
          AND LOWER(COALESCE(m.invoiceNumber, '')) LIKE CONCAT(${sanitizedSearchTerm})
${fromDate && toDate
                ? prisma_2.Prisma.sql `AND d.createdAt BETWEEN ${new Date(new Date(fromDate).setUTCHours(0, 0, 0, 0))} AND ${new Date(new Date(toDate).setUTCHours(23, 59, 59, 999))}`
                : prisma_2.Prisma.sql ``}
      ORDER BY d.createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
      `;
            const totalCount = await prisma_1.default.$queryRaw `
        SELECT COUNT(*) AS total_count
        FROM invoice_detail
        WHERE 
          businessId = ${Number(businessId)}
          AND itemId = ${Number(itemId)}
${fromDate && toDate
                ? prisma_2.Prisma.sql `AND createdAt BETWEEN ${new Date(new Date(fromDate).setUTCHours(0, 0, 0, 0))} AND ${new Date(new Date(toDate).setUTCHours(23, 59, 59, 999))}`
                : prisma_2.Prisma.sql ``}
      `;
            const totalItems = Number(totalCount[0].total_count || 0);
            const totalPages = Math.ceil(totalItems / limit);
            return {
                success: true,
                data: {
                    data: histories || [],
                    totalPages: totalPages || 1,
                },
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "item-service",
                message: "single item analysis failed",
                details: error.message,
                context: { businessId, itemId },
            });
            return {
                success: false,
                message: error.message,
            };
        }
    }
}
exports.default = new ItemService();
//# sourceMappingURL=item.service.js.map