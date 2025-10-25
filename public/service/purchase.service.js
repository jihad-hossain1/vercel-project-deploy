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
const inventory_service_1 = __importDefault(require("./inventory.service"));
const jwt_service_1 = __importDefault(require("../utils/jwt.service"));
class PurchaseService {
    async createPurchase(purchaseData, authToken) {
        const safeParse = validate_1.PurchaseSchema.safeParse(purchaseData);
        if (!safeParse.success) {
            return {
                success: false,
                error: "validation error",
                message: safeParse.error.message,
            };
        }
        try {
            const { supplierId, businessId, expectedDeliveryDate, subtotal, taxAmount = 0, discountAmount = 0, shippingCost = 0, totalAmount, status = "pending", paymentStatus = "unpaid", notes, createdBy, supplierEmail, supplierName, supplierAddress, supplierPhone } = safeParse.data;
            const { items = [] } = purchaseData;
            const safeParseItems = validate_1.PurchaseItemListSchema.safeParse(items?.map((item) => ({
                ...item,
                itemName: item?.name,
            })));
            if (!safeParseItems.success) {
                return {
                    success: false,
                    error: "validation error",
                    message: safeParseItems.error.message,
                };
            }
            const purchaseDetailsData = safeParseItems.data;
            const purchaseNumber = await auto_code_generate_service_1.default.po_gen({
                businessId,
            });
            const _purchaseData = {
                purchaseNumber,
                supplierId: Number(supplierId),
                businessId: Number(businessId),
                supplierEmail,
                supplierName,
                purchaseDate: new Date(),
                expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : new Date(),
                subtotal,
                taxAmount,
                discountAmount,
                shippingCost,
                totalAmount,
                status,
                paymentStatus,
                notes,
                createdBy: Number(createdBy),
                supplierAddress,
                supplierPhone,
            };
            const result = await prisma_1.default.$transaction(async (tx) => {
                const purchase = await tx.purchases.create({
                    data: {
                        ..._purchaseData,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });
                if (purchaseDetailsData.length > 0) {
                    const detailsWithPurchaseId = purchaseDetailsData.map((detail) => ({
                        ...detail,
                        purchaseId: purchase.id,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }));
                    const details = await tx.purchase_detail.createMany({
                        data: detailsWithPurchaseId,
                    });
                    return {
                        purchase,
                        details,
                    };
                }
                return {
                    purchase,
                    details: [],
                };
            });
            await dashboard_service_1.default.updateDashboardStats({
                businessId,
                stats: {
                    purchases: 1,
                },
            });
            const decryptToken = (await jwt_service_1.default.verify(authToken));
            if (decryptToken?.isStockBased) {
                await inventory_service_1.default.updateProductInventory({
                    products: items,
                    businessId,
                });
                await inventory_service_1.default.updateStockMovement({
                    products: items,
                    businessId,
                    userId: Number(createdBy),
                    purchaseId: result?.purchase?.id,
                });
            }
            const user_pr = await prisma_1.default.$queryRaw `
        SELECT * FROM user_profile WHERE businessId = ${Number(businessId)}
      `;
            return {
                success: true,
                data: { ...result, user_profile: user_pr[0] },
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "purchase-service",
                message: "Create purchase failed with unknown error",
                context: { businessId: purchaseData?.businessId },
            });
            return {
                success: false,
                error: "Failed to create purchase due to an unknown error",
            };
        }
    }
    async getPurchaseById(businessId, id) {
        try {
            const purchase = await prisma_1.default.purchases.findFirst({
                where: {
                    id: Number(id),
                    businessId: Number(businessId),
                },
            });
            if (!purchase) {
                return {
                    success: false,
                    error: "Purchase not found",
                };
            }
            const purchase_details = await prisma_1.default.purchase_detail.findMany({
                where: { purchaseId: purchase.id },
            });
            return {
                success: true,
                data: {
                    purchase: purchase,
                    purchase_details: purchase_details,
                },
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "purchase-service",
                message: "Get purchase by id failed with unknown error",
                context: { businessId, id },
            });
            return {
                success: false,
                error: "Failed to get purchase details",
            };
        }
    }
    async updatePurchase(props) {
        const { businessId, id, updateData } = props;
        try {
            if (updateData?.status) {
                return await this.updatePurchaseStatus({
                    businessId,
                    id,
                    status: updateData.status,
                });
            }
            if (updateData?.isSupplierUpdate) {
                return await this.updatePurchaseSupplier({
                    businessId,
                    id,
                    updateData,
                });
            }
            if (updateData?.isItemEditMode && updateData.items) {
                return await this.updatePurchaseItems(businessId, id, updateData.items, updateData.subtotal || 0, updateData.totalAmount || 0, updateData.discountAmount || 0, updateData.taxAmount || 0, updateData.shippingCost || 0);
            }
            if (updateData?.isDetailEditMod) {
                return await this.updatePurchaseDetails({
                    businessId,
                    id,
                    updateData,
                });
            }
            log_service_1.default.error({
                source: "purchase-service",
                message: "Invalid update request",
                context: { businessId, id, updateData },
            });
            return {
                success: false,
                error: "Invalid update request type",
            };
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_1.default.error({
                    source: "purchase-service",
                    message: "Update purchase failed",
                    details: error.message,
                    context: { businessId, id, updateData },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            log_service_1.default.error({
                source: "purchase-service",
                message: "Update purchase failed with unknown error",
                context: { businessId, id, updateData },
            });
            return {
                success: false,
                error: "Failed to update purchase due to an unknown error",
            };
        }
    }
    async updatePurchaseStatus(props) {
        const { businessId, id, status } = props;
        try {
            const result = await prisma_1.default.purchases.updateMany({
                where: { id: Number(id), businessId: Number(businessId) },
                data: { status, updatedAt: new Date() },
            });
            if (result.count === 0) {
                log_service_1.default.error({
                    source: "purchase-service",
                    message: "Purchase not found for status update",
                    context: { businessId, id, status },
                });
                return {
                    success: false,
                    error: "Purchase not found",
                };
            }
            return {
                success: true,
                data: { updatedStatus: status },
            };
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_1.default.error({
                    source: "purchase-service",
                    message: "Update purchase status failed",
                    details: error.message,
                    context: { businessId, id, status },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            log_service_1.default.error({
                source: "purchase-service",
                message: "Update purchase status failed with unknown error",
                context: { businessId, id, status },
            });
            return {
                success: false,
                error: "Failed to update purchase status due to an unknown error",
            };
        }
    }
    async updatePurchaseSupplier(props) {
        const { businessId, id, updateData } = props;
        try {
            const result = await prisma_1.default.purchases.updateMany({
                where: { id: Number(id), businessId: Number(businessId) },
                data: {
                    supplierName: updateData?.supplierName || undefined,
                    supplierEmail: updateData?.supplierEmail || undefined,
                    supplierAddress: updateData?.supplierAddress || undefined,
                    supplierPhone: updateData?.supplierPhone || undefined,
                    updatedAt: new Date(),
                },
            });
            if (result.count === 0) {
                log_service_1.default.error({
                    source: "purchase-service",
                    message: "Purchase not found for supplier update",
                    context: { businessId, id, updateData },
                });
                return {
                    success: false,
                    error: "Purchase not found",
                };
            }
            return {
                success: true,
                data: { updatedSupplier: true },
            };
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_1.default.error({
                    source: "purchase-service",
                    message: "Update purchase supplier failed",
                    details: error.message,
                    context: { businessId, id, updateData },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            log_service_1.default.error({
                source: "purchase-service",
                message: "Update purchase supplier failed with unknown error",
                context: { businessId, id, updateData },
            });
            return {
                success: false,
                error: "Failed to update purchase supplier due to an unknown error",
            };
        }
    }
    async updatePurchaseItems(businessId, purchaseId, items, subtotal, totalAmount, discountAmount, taxAmount, shippingCost) {
        try {
            const existingPurchaseItems = await prisma_1.default.purchase_detail.findMany({
                where: { purchaseId: Number(purchaseId) },
            });
            const safeParseItems = validate_1.PurchaseItemListSchema.safeParse(items);
            if (!safeParseItems.success) {
                log_service_1.default.error({
                    source: "purchase-service",
                    message: "Invalid items data provided",
                    details: safeParseItems.error.message,
                    context: { businessId, purchaseId },
                });
                return {
                    success: false,
                    error: "Invalid items data provided",
                    message: safeParseItems.error.message,
                };
            }
            const validatedItems = safeParseItems.data;
            const newItems = [];
            const itemsToUpdate = [];
            const itemsToDelete = [];
            const existingItemsMap = new Map(existingPurchaseItems.map((item) => [item.itemId, item]));
            const incomingItemIds = new Set(validatedItems.map((item) => item.itemId));
            for (const incomingItem of validatedItems) {
                const existingItem = existingItemsMap.get(incomingItem.itemId);
                if (!existingItem) {
                    newItems.push({
                        ...incomingItem,
                        purchaseId: Number(purchaseId),
                        businessId: Number(businessId),
                    });
                }
                else {
                    if (existingItem.quantity !== incomingItem.quantity) {
                        itemsToUpdate.push({
                            id: existingItem.id,
                            quantity: incomingItem.quantity,
                            lineTotal: incomingItem.lineTotal,
                        });
                    }
                }
            }
            for (const existingItem of existingPurchaseItems) {
                if (!incomingItemIds.has(existingItem.itemId)) {
                    itemsToDelete.push({
                        id: existingItem.id,
                        itemId: existingItem.itemId,
                        itemName: existingItem.itemName,
                    });
                }
            }
            const operations = await prisma_1.default.$transaction(async (tx) => {
                const ops = [];
                if (newItems.length > 0) {
                    const insertedItems = [];
                    for (const item of newItems) {
                        const insertedItem = await tx.purchase_detail.create({
                            data: item,
                        });
                        insertedItems.push(insertedItem);
                    }
                    ops.push({
                        type: "inserted",
                        count: insertedItems.length,
                        items: insertedItems,
                    });
                }
                if (itemsToUpdate.length > 0) {
                    const updatedItems = [];
                    for (const item of itemsToUpdate) {
                        const updatedItem = await tx.purchase_detail.update({
                            where: { id: item.id },
                            data: {
                                quantity: item.quantity,
                                lineTotal: item.lineTotal,
                                updatedAt: new Date(),
                            },
                        });
                        updatedItems.push(updatedItem);
                    }
                    ops.push({
                        type: "updated",
                        count: updatedItems.length,
                        items: updatedItems,
                    });
                }
                if (itemsToDelete.length > 0) {
                    const deletedItems = [];
                    for (const item of itemsToDelete) {
                        await tx.purchase_detail.delete({ where: { id: item.id } });
                        deletedItems.push(item);
                    }
                    ops.push({
                        type: "deleted",
                        count: deletedItems.length,
                        items: deletedItems,
                    });
                }
                const updatedPurchase = await tx.purchases.update({
                    where: { id: Number(purchaseId) },
                    data: {
                        subtotal,
                        totalAmount,
                        discountAmount,
                        taxAmount,
                        shippingCost,
                        updatedAt: new Date(),
                    },
                });
                return { operations: ops, purchase: updatedPurchase };
            });
            return {
                success: true,
                data: operations,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_1.default.error({
                    source: "purchase-service",
                    message: "Failed to update purchase items",
                    details: error.message,
                    context: {
                        businessId,
                        purchaseId,
                        error: error.stack,
                        items,
                        subtotal,
                        totalAmount,
                    },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            log_service_1.default.error({
                source: "purchase-service",
                message: "Failed to update purchase items with unknown error",
                context: {
                    businessId,
                    purchaseId,
                    items,
                    subtotal,
                    totalAmount,
                },
            });
            return {
                success: false,
                error: "Failed to update purchase items due to an unknown error",
            };
        }
    }
    async updatePurchaseDetails(props) {
        const { businessId, id: purchaseId, updateData } = props;
        const { purchaseDate, actualDeliveryDate, notes, taxAmount, expectedDeliveryDate } = updateData;
        try {
            const result = await prisma_1.default.purchases.updateMany({
                where: { id: Number(purchaseId), businessId: Number(businessId) },
                data: {
                    expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : undefined,
                    purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
                    actualDeliveryDate: actualDeliveryDate ? new Date(actualDeliveryDate) : undefined,
                    notes: notes || undefined,
                    taxAmount: taxAmount || undefined,
                    updatedAt: new Date(),
                },
            });
            if (result.count === 0) {
                log_service_1.default.error({
                    source: "purchase-service",
                    message: "Purchase not found for details update",
                    context: { businessId, purchaseId, updateData },
                });
                return {
                    success: false,
                    error: "Purchase not found",
                };
            }
            return {
                success: true,
                data: { updatedDetails: true },
            };
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_1.default.error({
                    source: "purchase-service",
                    message: "Failed to update purchase details",
                    details: error.message,
                    context: { businessId, purchaseId, updateData },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            log_service_1.default.error({
                source: "purchase-service",
                message: "Failed to update purchase details with unknown error",
                context: { businessId, purchaseId, updateData },
            });
            return {
                success: false,
                error: "Failed to update purchase details due to an unknown error",
            };
        }
    }
    async getPurchasesByBusiness(businessId, options = {}) {
        const { limit = 10, offset = 0, query = "", page = 1 } = options;
        if (!businessId || isNaN(businessId) || !Number.isInteger(Number(businessId)) || Number(businessId) <= 0)
            return {
                error: "Business Id must be a valid positive integer",
                success: false,
            };
        const calculatedOffset = Number(offset) || (Number(page) - 1) * Number(limit);
        try {
            const _purchases = await prisma_1.default.purchases.findMany({
                where: { businessId: Number(businessId) },
                orderBy: { id: "desc" },
                skip: calculatedOffset,
                take: Number(limit),
            });
            const totalCountResult = (await prisma_1.default.$queryRaw `
        SELECT COUNT(*) as total_count FROM purchases WHERE businessId = ${Number(businessId)}
      `);
            const totalCount = Number(totalCountResult[0].total_count);
            const totalPages = Math.ceil(totalCount / Number(limit));
            return {
                success: true,
                data: _purchases,
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
                source: "purchase-service",
                message: "get purchase failed",
                details: error.message,
                context: { businessId },
            });
            return { error: error?.message, success: false };
        }
    }
}
exports.default = new PurchaseService();
//# sourceMappingURL=purchase.service.js.map