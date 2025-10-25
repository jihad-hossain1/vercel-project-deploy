import { TInvoiceMasterSchema, TInvoiceCustomerUpdateSchema } from "../helpers/validate";
import { z } from "zod";
import { Prisma } from "../../generated/prisma/client";
type TItem = {
    id: number;
    name: string;
    quantity: number;
    unitPrice: number;
    tax?: number;
    discount?: number;
    lineTotal: number;
};
declare class InvoiceService {
    createInvoice(invoiceData: TInvoiceMasterSchema & {
        items: {
            id: Number;
            name: String;
            quantity: Number;
            unitPrice: Number;
            tax: Number;
            discount: Number;
        }[];
    }, auth_token: string): Promise<{
        success: boolean;
        errors: z.core.$ZodFlattenedError<{
            customerPhone: string;
            businessId: number;
            subtotal: number;
            tax: number;
            discount: number;
            deliveryCharge: number;
            totalAmount: number;
            status: "paid" | "credit" | "unpaid" | "archive";
            createdBy: number;
            id?: number;
            invoiceNumber?: string;
            customerId?: number;
            customerName?: string;
            customerEmail?: string;
            customerAddress?: string;
            invoiceDate?: string;
            dueDate?: string;
            notes?: string;
            createdAt?: Date;
            updatedAt?: Date;
            paymentInfo?: Record<string, never>;
        }, string>;
        error: string;
        result?: undefined;
    } | {
        success: boolean;
        errors: string[][];
        error: string;
        result?: undefined;
    } | {
        success: boolean;
        errors: {
            itemId: number;
            message: string;
        }[];
        error: string;
        result?: undefined;
    } | {
        success: boolean;
        result: {
            user_profile: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                businessId: number;
                address: string | null;
                avatar: string | null;
                organization: string | null;
                contactNumber: string | null;
                contactEmail: string | null;
                website: string | null;
                country: string | null;
                state: string | null;
                city: string | null;
                about: string | null;
                userId: number;
            };
            invoiceMaster: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                businessId: number;
                invoiceNumber: string;
                customerId: number | null;
                customerPhone: string;
                customerName: string | null;
                customerEmail: string | null;
                customerAddress: string | null;
                invoiceDate: Date | null;
                dueDate: Date | null;
                subtotal: Prisma.Decimal;
                dueAmount: Prisma.Decimal | null;
                tax: Prisma.Decimal | null;
                discount: Prisma.Decimal | null;
                deliveryCharge: Prisma.Decimal | null;
                totalAmount: Prisma.Decimal;
                status: string;
                notes: string | null;
                createdBy: number;
                paymentInfo: Prisma.JsonValue | null;
            };
        };
        errors?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        errors?: undefined;
        result?: undefined;
    }>;
    createInvoiceMaster(invoiceData: TInvoiceMasterSchema): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        businessId: number;
        invoiceNumber: string;
        customerId: number | null;
        customerPhone: string;
        customerName: string | null;
        customerEmail: string | null;
        customerAddress: string | null;
        invoiceDate: Date | null;
        dueDate: Date | null;
        subtotal: Prisma.Decimal;
        dueAmount: Prisma.Decimal | null;
        tax: Prisma.Decimal | null;
        discount: Prisma.Decimal | null;
        deliveryCharge: Prisma.Decimal | null;
        totalAmount: Prisma.Decimal;
        status: string;
        notes: string | null;
        createdBy: number;
        paymentInfo: Prisma.JsonValue | null;
    }>;
    getInvoicesByBusiness(businessId: number, options: {
        limit?: number;
        offset?: number;
        query?: string;
        page?: number;
        fromDate?: string;
        toDate?: string;
    }): Promise<{
        error: string;
        success: boolean;
        data?: undefined;
        pagination?: undefined;
    } | {
        success: boolean;
        data: unknown;
        pagination: {
            totalPages: number;
            totalCount: number;
        };
        error?: undefined;
    }>;
    updateInvoice(businessId: number, invoiceId: number, invoiceData: {
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
    }): Promise<{
        success: boolean;
        error: string;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    updateInvoiceDetails({ businessId, invoiceId, invoiceDate, dueDate, notes, paymentInfo }: {
        businessId: number;
        invoiceId: number;
        invoiceDate?: string;
        dueDate?: string;
        notes?: string;
        paymentInfo?: string;
    }): Promise<{
        success: boolean;
        error: string;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    updateInvoiceItems({ businessId, invoiceId, items, subtotal, totalAmount, discount, tax, deliveryCharge }: {
        businessId: number;
        invoiceId: number;
        items: TItem[];
        subtotal: number;
        totalAmount: number;
        discount: number;
        tax: number;
        deliveryCharge: number;
    }): Promise<{
        success: boolean;
        error: string;
    } | {
        success: boolean;
        error?: undefined;
    }>;
    updateInvoiceCustomer(businessId: number, invoiceId: number, customerForm: TInvoiceCustomerUpdateSchema): Promise<{
        success: boolean;
        errors: z.core.$ZodFlattenedError<{
            customerPhone: string;
            customerId?: number;
            customerName?: string;
            customerEmail?: string;
            customerAddress?: string;
        }, string>;
        error: string;
    } | {
        success: boolean;
        errors?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        errors?: undefined;
    }>;
    updateInvoiceStatus(props: {
        businessId: number;
        invoiceId: number;
        status: string;
    }): Promise<{
        success: boolean;
        errors: z.core.$ZodFlattenedError<{
            businessId: number;
            invoiceId: number;
            status: "paid" | "credit" | "unpaid" | "archive";
        }, string>;
        error: string;
    } | {
        success: boolean;
        errors?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        errors?: undefined;
    }>;
    getInvoiceById(businessId: number, invoiceId: number): Promise<{
        success: boolean;
        data: {
            invoice_master: {
                invoiceDetails: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    businessId: number;
                    description: string | null;
                    unitPrice: Prisma.Decimal;
                    tax: Prisma.Decimal | null;
                    discount: Prisma.Decimal | null;
                    itemId: number;
                    itemName: string;
                    quantity: Prisma.Decimal;
                    lineTotal: Prisma.Decimal;
                    invoiceMasterId: number;
                }[];
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                businessId: number;
                invoiceNumber: string;
                customerId: number | null;
                customerPhone: string;
                customerName: string | null;
                customerEmail: string | null;
                customerAddress: string | null;
                invoiceDate: Date | null;
                dueDate: Date | null;
                subtotal: Prisma.Decimal;
                dueAmount: Prisma.Decimal | null;
                tax: Prisma.Decimal | null;
                discount: Prisma.Decimal | null;
                deliveryCharge: Prisma.Decimal | null;
                totalAmount: Prisma.Decimal;
                status: string;
                notes: string | null;
                createdBy: number;
                paymentInfo: Prisma.JsonValue | null;
            };
            invoice_details: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                businessId: number;
                description: string | null;
                unitPrice: Prisma.Decimal;
                tax: Prisma.Decimal | null;
                discount: Prisma.Decimal | null;
                itemId: number;
                itemName: string;
                quantity: Prisma.Decimal;
                lineTotal: Prisma.Decimal;
                invoiceMasterId: number;
            }[];
            user_profile: {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                businessId: number;
                address: string | null;
                avatar: string | null;
                organization: string | null;
                contactNumber: string | null;
                contactEmail: string | null;
                website: string | null;
                country: string | null;
                state: string | null;
                city: string | null;
                about: string | null;
                userId: number;
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
}
declare const _default: InvoiceService;
export default _default;
//# sourceMappingURL=invoice.service.d.ts.map