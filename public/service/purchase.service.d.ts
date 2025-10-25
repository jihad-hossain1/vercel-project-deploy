import { z } from "zod";
import { PurchaseSchema, TPurchaseSchema, TPurchaseItemListSchema, TUserProfileSchema } from "../helpers/validate";
import { Prisma } from "../../generated/prisma";
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
interface PurchaseResult {
    purchase: TPurchaseSchema;
    details: TPurchaseItemListSchema[] | [];
    user_profile?: TUserProfileSchema | null;
}
declare class PurchaseService {
    createPurchase(purchaseData: z.infer<typeof PurchaseSchema> & {
        items?: PurchaseItem[];
    }, authToken: string): Promise<ServiceResponse<PurchaseResult>>;
    getPurchaseById(businessId: number, id: number): Promise<ServiceResponse<{
        purchase: TPurchaseSchema;
        purchase_details: TPurchaseItemListSchema[];
    }>>;
    updatePurchase(props: PurchaseProps): Promise<ServiceResponse>;
    updatePurchaseStatus(props: {
        businessId: number;
        id: number;
        status: "pending" | "ordered" | "received" | "cancelled" | "credit" | "paid";
    }): Promise<ServiceResponse>;
    updatePurchaseSupplier(props: PurchaseProps): Promise<ServiceResponse>;
    updatePurchaseItems(businessId: number, purchaseId: number, items: PurchaseItem[], subtotal: number, totalAmount: number, discountAmount: number, taxAmount: number, shippingCost: number): Promise<ServiceResponse>;
    updatePurchaseDetails(props: UpdatePurchaseDetailsProps): Promise<ServiceResponse>;
    getPurchasesByBusiness(businessId: number, options?: {
        limit?: number;
        offset?: number;
        query?: string;
        page?: number;
    }): Promise<{
        success: boolean;
        data: {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            businessId: number;
            subtotal: Prisma.Decimal;
            totalAmount: Prisma.Decimal;
            status: string;
            notes: string | null;
            createdBy: number;
            purchaseNumber: string;
            supplierId: number;
            supplierName: string;
            supplierEmail: string;
            supplierAddress: string | null;
            supplierPhone: string | null;
            purchaseDate: Date;
            expectedDeliveryDate: Date;
            actualDeliveryDate: Date;
            taxAmount: Prisma.Decimal | null;
            discountAmount: Prisma.Decimal | null;
            shippingCost: Prisma.Decimal | null;
            paymentStatus: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            totalPages: number;
            totalCount: number;
        };
        error?: undefined;
    } | {
        error: any;
        success: boolean;
        data?: undefined;
        pagination?: undefined;
    }>;
}
declare const _default: PurchaseService;
export default _default;
//# sourceMappingURL=purchase.service.d.ts.map