import { z } from "zod";
import prisma from "../lib/prisma";
import { PurchaseSchema, PurchaseItemListSchema, TPurchaseSchema, TPurchaseItemListSchema, TUserProfileSchema } from "../helpers/validate";
import logService from "./log.service";
import autoCodeGenerateService from "./auto-code-generate.service";
import dashboardService from "./dashboard.service";
import inventoryService from "./inventory.service";
import { Prisma } from "../../generated/prisma";
import jwtService from "../utils/jwt.service";

interface PurchaseItem {
    id?: number | null;
    purchaseId?: number | null;
    itemId: number;
    itemName: string;
    quantity: number;
    lineTotal: number;
    businessId: number;
    unitPrice?: number | null;
    unitCost?: number | null;
    costPrice?: number | null;
    receivedQuantity?: number | null;
    createdAt?: Date;
    updatedAt?: Date;
    name?: string;
}
// {
//     itemId: 1,
//     name: 'keyboard 3',
//     quantity: 1,
//     unitPrice: 2000,
//     lineTotal: 0,
//     costPrice: 1500,
//     businessId: 1
//   }

interface UpdatePurchaseDetailsProps {
    businessId: number;
    id: number;
    updateData: {
        purchaseDate?: string;
        actualDeliveryDate?: string;
        expectedDeliveryDate?: string;
        notes?: string;
        taxAmount?: number;
    };
}

interface PurchaseProps {
    businessId: number;
    id: number;
    updateData?: {
        status?: "pending" | "ordered" | "received" | "cancelled" | "credit" | "paid";
        isSupplierUpdate?: boolean;
        isItemEditMode?: boolean;
        isDetailEditMod?: boolean;
        supplierName?: string;
        supplierEmail?: string;
        supplierAddress?: string;
        supplierPhone?: string;
        items?: PurchaseItem[];
        subtotal?: number;
        taxAmount?: number;
        discountAmount?: number;
        shippingCost?: number;
        totalAmount?: number;
    };
}

// Define response types
interface ErrorResponse {
    success: false;
    error: string;
    message?: string;
}

interface SuccessResponse<T = unknown> {
    success: true;
    data?: T;
}

type ServiceResponse<T = unknown> = ErrorResponse | SuccessResponse<T>;

// Define purchase result type
interface PurchaseResult {
    purchase: TPurchaseSchema;
    details: TPurchaseItemListSchema[] | [];
    user_profile?: TUserProfileSchema | null;
}

class PurchaseService {
    async createPurchase(purchaseData: z.infer<typeof PurchaseSchema> & { items?: PurchaseItem[] }, authToken: string): Promise<ServiceResponse<PurchaseResult>> {
        const safeParse = PurchaseSchema.safeParse(purchaseData);

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

            const safeParseItems = PurchaseItemListSchema.safeParse(
                items?.map((item) => ({
                    ...item,
                    itemName: item?.name!,
                })),
            );

            if (!safeParseItems.success) {
                return {
                    success: false,
                    error: "validation error",
                    message: safeParseItems.error.message,
                };
            }

            const purchaseDetailsData = safeParseItems.data;

            // Generate purchase number
            const purchaseNumber = await autoCodeGenerateService.po_gen({
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

            const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                // Create purchase master
                const purchase = await tx.purchases.create({
                    data: {
                        ..._purchaseData,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    },
                });

                // Create purchase details if provided
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

            // increment purchases count in business stats
            await dashboardService.updateDashboardStats({
                businessId,
                stats: {
                    purchases: 1,
                },
            });

            const decryptToken = (await jwtService.verify(authToken)) as { isStockBased: boolean };

            if (decryptToken?.isStockBased) {
                // update product stock
                await inventoryService.updateProductInventory({
                    products: items as any,
                    businessId,
                });

                await inventoryService.updateStockMovement({
                    products: items as any,
                    businessId,
                    userId: Number(createdBy),
                    purchaseId: result?.purchase?.id,
                });
            }

            const user_pr = await prisma.$queryRaw`
        SELECT * FROM user_profile WHERE businessId = ${Number(businessId)}
      `;

            return {
                success: true,
                data: { ...result, user_profile: user_pr[0] }  as any,
            };
        } catch (error) {
            logService.error({
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

    async getPurchaseById(
        businessId: number,
        id: number,
    ): Promise<
        ServiceResponse<{
            purchase: TPurchaseSchema;
            purchase_details: TPurchaseItemListSchema[];
        }>
    > {
        try {
            const purchase = await prisma.purchases.findFirst({
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

            const purchase_details = await prisma.purchase_detail.findMany({
                where: { purchaseId: purchase.id },
            });

            return {
                success: true,
                data: {
                    purchase: purchase as any,
                    purchase_details: purchase_details as any[],
                },
            };
        } catch (error) {
            logService.error({
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

    async updatePurchase(props: PurchaseProps): Promise<ServiceResponse> {
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

            logService.error({
                source: "purchase-service",
                message: "Invalid update request",
                context: { businessId, id, updateData },
            });

            return {
                success: false,
                error: "Invalid update request type",
            };
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
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

            logService.error({
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

    async updatePurchaseStatus(props: { businessId: number; id: number; status: "pending" | "ordered" | "received" | "cancelled" | "credit" | "paid" }): Promise<ServiceResponse> {
        const { businessId, id, status } = props;

        try {
            const result = await prisma.purchases.updateMany({
                where: { id: Number(id), businessId: Number(businessId) },
                data: { status, updatedAt: new Date() },
            });

            if (result.count === 0) {
                logService.error({
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
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
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

            logService.error({
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

    async updatePurchaseSupplier(props: PurchaseProps): Promise<ServiceResponse> {
        const { businessId, id, updateData } = props;

        try {
            const result = await prisma.purchases.updateMany({
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
                logService.error({
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
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
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

            logService.error({
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

    async updatePurchaseItems(businessId: number, purchaseId: number, items: PurchaseItem[], subtotal: number, totalAmount: number, discountAmount: number, taxAmount: number, shippingCost: number): Promise<ServiceResponse> {
        try {
            // Get existing purchase items
            const existingPurchaseItems = await prisma.purchase_detail.findMany({
                where: { purchaseId: Number(purchaseId) },
            });

            // Validate input items
            const safeParseItems = PurchaseItemListSchema.safeParse(items);
            if (!safeParseItems.success) {
                logService.error({
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

            // Process items to identify new items and items with quantity changes
            const newItems: PurchaseItem[] = [];
            const itemsToUpdate: Array<{
                id: number;
                quantity: number;
                lineTotal: number;
            }> = [];
            const itemsToDelete: Array<{
                id: number;
                itemId: number;
                itemName: string;
            }> = [];

            // Create a map of existing items for efficient lookup
            type ExistingDetail = Awaited<ReturnType<typeof prisma.purchase_detail.findMany>>[number];
            const existingItemsMap = new Map<number, ExistingDetail>(existingPurchaseItems.map((item: any) => [item.itemId, item]));

            // Create a set of incoming item IDs for efficient lookup
            const incomingItemIds = new Set(validatedItems.map((item) => item.itemId));

            // Process incoming items
            for (const incomingItem of validatedItems) {
                const existingItem = existingItemsMap.get(incomingItem.itemId);

                if (!existingItem) {
                    // new item - prepare for insertion
                    newItems.push({
                        ...incomingItem,
                        purchaseId: Number(purchaseId),
                        businessId: Number(businessId),
                    });
                } else {
                    // Check if quantity has changed
                    if (existingItem.quantity !== incomingItem.quantity) {
                        // Quantity has changed - prepare for update
                        itemsToUpdate.push({
                            id: existingItem.id,
                            quantity: incomingItem.quantity,
                            lineTotal: incomingItem.lineTotal,
                        });
                    }
                }
            }

            // Identify items to delete - existing items that are not in incoming items
            for (const existingItem of existingPurchaseItems) {
                if (!incomingItemIds.has(existingItem.itemId)) {
                    itemsToDelete.push({
                        id: existingItem.id,
                        itemId: existingItem.itemId,
                        itemName: existingItem.itemName,
                    });
                }
            }

            // Use database transaction to ensure atomicity
            const operations = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                const ops = [];

                // Insert new items
                if (newItems.length > 0) {
                    const insertedItems = [] as ExistingDetail[];
                    for (const item of newItems) {
                        const insertedItem = await tx.purchase_detail.create({
                            data: item      as any,
                        });
                        insertedItems.push(insertedItem);
                    }
                    ops.push({
                        type: "inserted",
                        count: insertedItems.length,
                        items: insertedItems,
                    });
                }

                // Update existing items with quantity changes
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

                // Delete items that are no longer in the purchase
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

                // update purchase master
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
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
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

            logService.error({
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

    async updatePurchaseDetails(props: UpdatePurchaseDetailsProps): Promise<ServiceResponse> {
        const { businessId, id: purchaseId, updateData } = props;
        const { purchaseDate, actualDeliveryDate, notes, taxAmount, expectedDeliveryDate } = updateData;

        try {
            const result = await prisma.purchases.updateMany({
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
                logService.error({
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
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
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

            logService.error({
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
    async getPurchasesByBusiness(
        businessId: number,
        options = {} as {
            limit?: number;
            offset?: number;
            query?: string;
            page?: number;
        },
    ) {
        const { limit = 10, offset = 0, query = "", page = 1 } = options;

        if (!businessId || isNaN(businessId) || !Number.isInteger(Number(businessId)) || Number(businessId) <= 0)
            return {
                error: "Business Id must be a valid positive integer",
                success: false,
            };

        // For page-based pagination: page 1 should start at offset 0
        const calculatedOffset = Number(offset) || (Number(page) - 1) * Number(limit);

        // // Build where conditions
        // const whereConditions = [eq(purchases.businessId, Number(businessId))];

        // // Add query filter for codeName if provided
        // if (query && query.trim() !== "") {
        //   whereConditions.push(
        //     ilike(purchases.purchaseNumber, `%${query.trim()}%`)
        //   );
        // }

        try {
            const _purchases = await prisma.purchases.findMany({
                where: { businessId: Number(businessId) },
                orderBy: { id: "desc" },
                skip: calculatedOffset,
                take: Number(limit),
            });

            const totalCountResult = (await prisma.$queryRaw`
        SELECT COUNT(*) as total_count FROM purchases WHERE businessId = ${Number(businessId)}
      `) as { total_count: number }[];

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
        } catch (error) {
            logService.error({
                source: "purchase-service",
                message: "get purchase failed",
                details: error.message,
                context: { businessId },
            });
            return { error: error?.message, success: false };
        }
    }
}

export default new PurchaseService();
