import prisma from "../lib/prisma";
import logService from "./log.service";
import autoGen from "./auto-code-generate.service";
import { invoiceMasterSchema, InvoiceItemsSchema, invoiceCustomerUpdateSchema, TInvoiceMasterSchema, TInvoiceItemsSchema, TInvoiceCustomerUpdateSchema, TInvoiceDetailsSchema } from "../helpers/validate";
import { z } from "zod";
import dashboardService from "./dashboard.service";
import { Prisma } from "../../generated/prisma/client";
import inventoryService from "./inventory.service";
import jwtService from "../utils/jwt.service";

const UpdateInvoiceStatusSchema = z.object({
    businessId: z.number().int().positive(),
    invoiceId: z.number().int().positive(),
    status: z.enum(["paid", "credit", "unpaid", "archive"]),
});

type TItem = {
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    tax?: number;
    discount?: number;
    lineTotal: number;
};

class InvoiceService {
    async createInvoice(
        invoiceData: TInvoiceMasterSchema & {
            items: {
                id: Number;
                name: String;
                quantity: Number;
                unitPrice: Number;
                tax: Number;
                discount: Number;
            }[];
        },
        auth_token: string,
    ) {
        const { customerPhone, customerId, businessId, invoiceDate, dueDate, notes, items, createdBy, subtotal, tax, discount, totalAmount, customerName, customerEmail, customerAddress, paymentInfo, deliveryCharge, status } = invoiceData;

        const validateSchema = invoiceMasterSchema.safeParse({
            customerPhone,
            customerId: customerId || 1,
            businessId,
            invoiceDate,
            dueDate,
            notes,
            createdBy,
            subtotal,
            tax,
            discount,
            deliveryCharge,
            totalAmount,
            customerName,
            customerEmail,
            customerAddress,
            paymentInfo,
            status,
        });

        if (!validateSchema.success)
            return {
                success: false,
                errors: validateSchema.error.flatten(),
                error: "Required Field Missing",
            };

        const refineItems = items?.map((item) => ({
            itemId: Number(item.id),
            itemName: String(item.name || ""),
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            lineTotal: Number(item.quantity) * Number(item.unitPrice),
            businessId: Number(businessId),
            tax: item?.tax,
            discount: item?.discount,
        }));

        const validateItemsSchema = InvoiceItemsSchema.safeParse(refineItems);

        if (!validateItemsSchema.success)
            return {
                success: false,
                errors: validateItemsSchema.error.flatten().fieldErrors,
                error: "Required item fields are missing",
            };

        const safeItems = validateItemsSchema.data;

        try {
            const token = (await jwtService.verify(auth_token as string)) as {
                isStockManaged: boolean;
            };

            if (token?.isStockManaged) {
                const itemIds = safeItems.map((item) => item.itemId);
                const stockCount = (await prisma.$queryRaw`
              select itemId, sum(qty) as totalStock
              from stock_movements
              where itemId in (${Prisma.join(itemIds)})
              group by itemId
              `) as { itemId: number; totalStock: number }[];
                // which items are not in stock
                const notInStockItems = safeItems.filter((item) => {
                    const stock = stockCount.find((count) => count.itemId == item.itemId);
                    return !stock || stock.totalStock < item.quantity;
                });
                if (notInStockItems.length > 0)
                    return {
                        success: false,
                        errors: notInStockItems.map((item) => ({
                            itemId: item.itemId,
                            message: `Item ${item.itemName} is not in stock`,
                        })),
                        error: "Item not in stock",
                    };
            }

            const genInv = await autoGen.inv_gen({ businessId });

            const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                const newInvoice = await tx.invoice_master.create({
                    data: {
                        customerId: customerId ?? null,
                        businessId: Number(businessId),
                        customerName: customerName ?? null,
                        customerEmail: customerEmail ?? null,
                        customerPhone: customerPhone ?? null,
                        customerAddress: customerAddress ?? null,
                        invoiceDate: invoiceDate ? new Date(invoiceDate) : new Date(),
                        dueDate: dueDate ? new Date(dueDate) : null,
                        subtotal: Number(subtotal ?? 0),
                        tax: Number(tax ?? 0),
                        discount: Number(discount ?? 0),
                        deliveryCharge: Number(deliveryCharge ?? 0),
                        totalAmount: Number(totalAmount ?? 0),
                        status: status ?? "unpaid",
                        notes: notes ?? null,
                        createdBy: Number(createdBy),
                        invoiceNumber: genInv,
                        paymentInfo: paymentInfo ?? null,
                    },
                });

                // Create invoice details
                if (validateItemsSchema.data.length > 0) {
                    await tx.invoice_detail.createMany({
                        data: validateItemsSchema.data.map((item) => ({
                            ...item,
                            invoiceMasterId: newInvoice.id,
                        })),
                    });
                }
                return { invoiceMaster: newInvoice };
            });

            // increment invoice count in business stats
            await dashboardService.updateDashboardStats({
                businessId,
                stats: {
                    invoices: 1,
                },
            });

            // update stock if stock management is enabled
            if (token?.isStockManaged) {
                await inventoryService.updateStockMovement({
                    products: safeItems.map((item) => ({
                        itemId: item.itemId,
                        quantity: -item.quantity,
                        movementType: "OUT",
                    })),
                    businessId,
                    userId: Number(createdBy),
                    saleId: result?.invoiceMaster?.id,
                });
            }

            const user_pr = await prisma.user_profile.findFirst({
                where: { businessId: Number(businessId) },
            });

            return { success: true, result: { ...result, user_profile: user_pr } };
        } catch (error) {
            logService.error({
                source: "invoice-service",
                message: "invoice create failed",
                details: `Failed to create invoice: ${error instanceof Error ? error.message : "Unknown error"}`,
                context: { businessId },
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    async createInvoiceMaster(invoiceData: TInvoiceMasterSchema) {
        try {
            const genInv = await autoGen.inv_gen({
                businessId: Number(invoiceData?.businessId),
            });
            const newInvoice = await prisma.invoice_master.create({
                data: {
                    customerPhone: invoiceData.customerPhone || null,
                    customerId: invoiceData.customerId || null,
                    businessId: Number(invoiceData?.businessId),
                    invoiceDate: invoiceData.invoiceDate ? new Date(invoiceData.invoiceDate) : new Date(),
                    dueDate: invoiceData.dueDate ? new Date(invoiceData.dueDate) : null,
                    subtotal: Number(invoiceData?.subtotal ?? 0),
                    tax: Number(invoiceData?.tax ?? 0),
                    discount: Number(invoiceData?.discount ?? 0),
                    deliveryCharge: Number(invoiceData?.deliveryCharge ?? 0),
                    totalAmount: Number(invoiceData?.totalAmount ?? 0),
                    status: invoiceData?.status ?? "unpaid",
                    notes: invoiceData?.notes ?? null,
                    createdBy: Number(invoiceData?.createdBy),
                    invoiceNumber: genInv,
                    paymentInfo: invoiceData?.paymentInfo ?? null,
                    customerAddress: invoiceData?.customerAddress ?? null,
                    customerName: invoiceData?.customerName ?? null,
                    customerEmail: invoiceData?.customerEmail ?? null,
                    dueAmount: invoiceData?.status == "unpaid" || invoiceData?.status == "credit" ? Number(invoiceData?.totalAmount ?? 0) : 0,
                },
            });
            return newInvoice;
        } catch (error) {
            throw new Error(`Failed to create invoice: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    async getInvoicesByBusiness(
        businessId: number,
        options: {
            limit?: number;
            offset?: number;
            query?: string;
            page?: number;
            fromDate?: string;
            toDate?: string;
        },
    ) {
        const { limit = 10, offset = 0, query = "", page = 1, fromDate, toDate } = options;

        if (!businessId || Number(businessId) <= 0)
            return {
                error: "Business Id must be a valid positive integer",
                success: false,
            };

        const calculatedOffset = Number(offset) || (Number(page) - 1) * Number(limit);

        const sanitizedSearchTerm = `%${query}%`;
        try {
            const invoices = await prisma.$queryRaw`
        SELECT * FROM invoice_master
        WHERE businessId = ${businessId}
        AND (LOWER(COALESCE(invoiceNumber, '')) LIKE CONCAT(${sanitizedSearchTerm})
          OR LOWER(COALESCE(customerName, '')) LIKE CONCAT(${sanitizedSearchTerm})
          OR LOWER(COALESCE(customerEmail, '')) LIKE CONCAT(${sanitizedSearchTerm})
          OR LOWER(COALESCE(customerPhone, '')) LIKE CONCAT(${sanitizedSearchTerm})
        )

${fromDate && toDate ? Prisma.sql`AND createdAt BETWEEN ${new Date(new Date(fromDate).setUTCHours(0, 0, 0, 0))} AND ${new Date(new Date(toDate).setUTCHours(23, 59, 59, 999))}` : Prisma.sql``}

        ORDER BY createdAt DESC
        LIMIT ${limit}
        OFFSET ${calculatedOffset}
      `;

            const totalCount = (await prisma.$queryRaw`
        SELECT COUNT(*) as totalCount FROM invoice_master
        WHERE businessId = ${businessId}
        AND (LOWER(COALESCE(invoiceNumber, '')) LIKE CONCAT(${sanitizedSearchTerm})
          OR LOWER(COALESCE(customerName, '')) LIKE CONCAT(${sanitizedSearchTerm})
          OR LOWER(COALESCE(customerEmail, '')) LIKE CONCAT(${sanitizedSearchTerm})
          OR LOWER(COALESCE(customerPhone, '')) LIKE CONCAT(${sanitizedSearchTerm})
        )
${fromDate && toDate ? Prisma.sql`AND createdAt BETWEEN ${new Date(new Date(fromDate).setUTCHours(0, 0, 0, 0))} AND ${new Date(new Date(toDate).setUTCHours(23, 59, 59, 999))}` : Prisma.sql``}
      `) as { totalCount: number }[];

            const totalCountNum = Number(totalCount[0].totalCount);
            const totalPages = Math.ceil(totalCountNum / Number(limit));

            return {
                success: true,
                data: invoices,
                pagination: { totalPages, totalCount: totalCountNum },
            };
        } catch (error) {
            logService.error({
                source: "invoice-service",
                message: "get invoices failed",
                details: error instanceof Error ? error.message : "Unknown error",
                context: { businessId },
            });
            return {
                error: error instanceof Error ? error.message : "Unknown error",
                success: false,
            };
        }
    }

    // Update invoice
    async updateInvoice(
        businessId: number,
        invoiceId: number,
        invoiceData: {
            customerEditMod?: boolean;
            customerForm?: TInvoiceCustomerUpdateSchema;
            isEditMode?: boolean;
            items?: TItem[];
            subtotal?: number;
            totalAmount?: number;
            discount?: number;
            tax?: number;
            deliveryCharge?: number;
            isDetailsEditMode?: boolean;
            invoiceDate?: string;
            dueDate?: string;
            notes?: string;
            paymentInfo?: string;
            statusEditMode?: boolean;
            status?: string;
        },
    ) {
        try {
            // update invoice customer information
            if (invoiceData?.customerEditMod) return await this.updateInvoiceCustomer(businessId, invoiceId, invoiceData?.customerForm!);

            // update invoice items
            if (invoiceData?.isEditMode)
                return await this.updateInvoiceItems({
                    businessId,
                    invoiceId,
                    items: invoiceData?.items!,
                    subtotal: invoiceData?.subtotal!,
                    totalAmount: invoiceData?.totalAmount!,
                    discount: invoiceData?.discount!,
                    tax: invoiceData?.tax!,
                    deliveryCharge: invoiceData?.deliveryCharge!,
                });

            // update invoice details
            if (invoiceData?.isDetailsEditMode)
                return await this.updateInvoiceDetails({
                    businessId,
                    invoiceId,
                    invoiceDate: invoiceData?.invoiceDate,
                    dueDate: invoiceData?.dueDate,
                    notes: invoiceData?.notes,
                    paymentInfo: invoiceData?.paymentInfo,
                });

            // update invoice status
            if (invoiceData?.statusEditMode)
                return await this.updateInvoiceStatus({
                    businessId,
                    invoiceId,
                    status: invoiceData?.status!,
                });

            return {
                success: false,
                error: "Bad Request for invoice update",
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    // update invoice details
    async updateInvoiceDetails({ businessId, invoiceId, invoiceDate, dueDate, notes, paymentInfo }: { businessId: number; invoiceId: number; invoiceDate?: string; dueDate?: string; notes?: string; paymentInfo?: string }) {
        if (!invoiceId || !businessId) return { success: false, error: "Invalid invoice or business id" };
        try {
            await prisma.invoice_master.updateMany({
                where: { id: Number(invoiceId), businessId: Number(businessId) },
                data: {
                    invoiceDate: invoiceDate ? new Date(invoiceDate) : null,
                    dueDate: dueDate ? new Date(dueDate) : null,
                    notes: notes ?? null,
                    paymentInfo: paymentInfo ?? null,
                    updatedAt: new Date(),
                },
            });
            return { success: true };
        } catch (error) {
            logService.error({
                source: "invoice-service",
                message: "invoice update details failed",
                details: error instanceof Error ? error.message : "Unknown error",
                context: { businessId, invoiceId },
            });
            return { success: false, error: "Failed to update invoice details" };
        }
    }

    // update invoice item
    async updateInvoiceItems({ businessId, invoiceId, items, subtotal, totalAmount, discount, tax, deliveryCharge }: { businessId: number; invoiceId: number; items: TItem[]; subtotal: number; totalAmount: number; discount: number; tax: number; deliveryCharge: number }) {
        try {
            const existingInvoiceItems = await prisma.invoice_detail.findMany({
                where: { invoiceMasterId: Number(invoiceId) },
            });

            if (!items || !Array.isArray(items)) {
                return { success: false, error: "Invalid items data provided" };
            }

            const newItems: TInvoiceDetailsSchema[] = [];
            const itemsToUpdate: TItem[] = [];
            const itemsToDelete: number[] = [];

            const existingItemsMap = new Map(existingInvoiceItems.map((i: any) => [i.itemId, i])) as any;
            const incomingItemIds = new Set(items.map((item: TItem) => Number(item.id)));

            for (const incomingItem of items) {
                const existingItem = existingItemsMap.get(Number(incomingItem.id));
                if (!existingItem) {
                    newItems.push({
                        invoiceMasterId: Number(invoiceId),
                        itemId: Number(incomingItem.id),
                        itemName: String(incomingItem.name || ""),
                        // description: incomingItem.description ?? null,
                        quantity: Number(incomingItem.quantity),
                        unitPrice: Number(incomingItem.unitPrice),
                        lineTotal: Number(incomingItem.quantity) * Number(incomingItem.unitPrice),
                        businessId: Number(businessId),
                        tax: incomingItem?.tax!,
                        discount: incomingItem?.discount!,
                    });
                } else {
                    const incomingQuantity = Number(incomingItem.quantity);
                    if (existingItem.quantity !== incomingQuantity) {
                        itemsToUpdate.push({
                            id: existingItem.id,
                            quantity: incomingQuantity,
                            lineTotal: incomingQuantity * Number(existingItem.unitPrice),
                            tax: incomingItem?.tax,
                            discount: incomingItem?.discount,
                            name: "",
                            unitPrice: 0,
                        });
                    }
                }
            }

            for (const existingItem of existingInvoiceItems) {
                if (!incomingItemIds.has(existingItem.itemId)) {
                    itemsToDelete.push(existingItem.id);
                }
            }

            await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
                if (newItems.length > 0) {
                    await tx.invoice_detail.createMany({ data: newItems as any });
                }
                for (const item of itemsToUpdate) {
                    await tx.invoice_detail.update({
                        where: { id: item.id },
                        data: {
                            quantity: item.quantity,
                            lineTotal: item.lineTotal,
                            tax: item.tax,
                            discount: item.discount,
                            updatedAt: new Date(),
                        },
                    });
                }
                if (itemsToDelete.length > 0) {
                    await tx.invoice_detail.deleteMany({
                        where: { id: { in: itemsToDelete } },
                    });
                }
                await tx.invoice_master.update({
                    where: { id: Number(invoiceId) },
                    data: {
                        subtotal: Number(subtotal ?? 0),
                        totalAmount: Number(totalAmount ?? 0),
                        discount: Number(discount ?? 0),
                        tax: Number(tax ?? 0),
                        deliveryCharge: Number(deliveryCharge ?? 0),
                        updatedAt: new Date(),
                    },
                });
            });

            return { success: true };
        } catch (error) {
            logService.error({
                source: "invoice-service",
                message: "Failed to update invoice items",
                details: error instanceof Error ? error.message : "Unknown error",
                context: {
                    businessId,
                    invoiceId,
                    error: error instanceof Error ? error.stack : "No stack trace available",
                },
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to update invoice items",
            };
        }
    }

    // update invoice customer
    async updateInvoiceCustomer(businessId: number, invoiceId: number, customerForm: TInvoiceCustomerUpdateSchema) {
        try {
            // validate customer field on invoice master
            const validateSchema = invoiceCustomerUpdateSchema.safeParse(customerForm);

            if (!validateSchema.success)
                return {
                    success: false,
                    errors: validateSchema.error.flatten(),
                    error: "Required Field Missing",
                };

            await prisma.invoice_master.updateMany({
                where: { id: Number(invoiceId), businessId: Number(businessId) },
                data: {
                    customerName: validateSchema.data?.customerName || "",
                    customerEmail: validateSchema.data?.customerEmail || "",
                    customerPhone: validateSchema.data?.customerPhone || "",
                    customerAddress: validateSchema.data?.customerAddress || "",
                    updatedAt: new Date(),
                },
            });

            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to update invoice customer",
            };
        }
    }

    async updateInvoiceStatus(props: { businessId: number; invoiceId: number; status: string }) {
        const parseResult = UpdateInvoiceStatusSchema.safeParse(props);
        if (!parseResult.success) {
            return {
                success: false,
                errors: parseResult.error.flatten(),
                error: "Invalid input data",
            };
        }
        const { businessId, invoiceId, status } = parseResult.data;
        try {
            await prisma.invoice_master.updateMany({
                where: { id: Number(invoiceId), businessId: Number(businessId) },
                data: { status, updatedAt: new Date() },
            });

            return { success: true };
        } catch (error) {
            // Log the error
            logService.error({
                source: "invoice-service",
                message: "Failed to update invoice status",
                details: error instanceof Error ? error.message : "Unknown error",
                context: {
                    businessId,
                    invoiceId,
                    error: error instanceof Error ? error.stack : "No stack trace available",
                },
            });
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to update invoice status",
            };
        }
    }

    // Get invoice by id
    async getInvoiceById(businessId: number, invoiceId: number) {
        try {
            const invoice = await prisma.invoice_master.findFirst({
                where: { id: Number(invoiceId), businessId: Number(businessId) },
                include: { invoiceDetails: true },
            });

            const user_pr = await prisma.user_profile.findFirst({
                where: { businessId: Number(businessId) },
            });

            return {
                success: true,
                data: {
                    invoice_master: invoice,
                    invoice_details: invoice?.invoiceDetails || [],
                    user_profile: user_pr,
                },
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Failed to get invoice by id",
            };
        }
    }
}

export default new InvoiceService();
