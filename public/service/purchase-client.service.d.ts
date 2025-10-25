import { TPurchaseClientSchema } from "../helpers/validate";
import { z } from "zod";
interface PurchaseClientOptions {
    page?: number;
    limit?: number;
    offset?: number;
    query?: string;
    orderBy?: string;
    orderDirection?: "asc" | "desc";
}
declare class PurchaseClientService {
    createPurchaseClient(clientData: {
        email: string;
        businessId: number;
    }): Promise<{
        success: boolean;
        error: string;
        client_exist?: undefined;
    } | {
        success: boolean;
        error: string;
        client_exist: boolean;
    } | {
        success: boolean;
        error?: undefined;
        client_exist?: undefined;
    }>;
    getPurchaseClientsByBusiness(businessId: number, options?: PurchaseClientOptions): Promise<{
        error: string;
        success: boolean;
        data?: undefined;
        pagination?: undefined;
    } | {
        success: boolean;
        data: {
            name: string;
            id: number;
            createdAt: Date;
            email: string;
            updatedAt: Date;
            isActive: boolean;
            businessId: number;
            address: string | null;
            country: string | null;
            state: string | null;
            city: string | null;
            phone: string | null;
            postalCode: string | null;
            contactPerson: string | null;
            taxId: string | null;
            paymentTerms: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            totalPages: number;
            totalCount: number;
        };
        error?: undefined;
    }>;
    getBusinessPurchaseClient(props: {
        id: number;
        businessId: number;
    }): Promise<{
        success: boolean;
        error: string;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            name: string;
            id: number;
            createdAt: Date;
            email: string;
            updatedAt: Date;
            isActive: boolean;
            businessId: number;
            address: string | null;
            country: string | null;
            state: string | null;
            city: string | null;
            phone: string | null;
            postalCode: string | null;
            contactPerson: string | null;
            taxId: string | null;
            paymentTerms: string | null;
        };
        error?: undefined;
    }>;
    updatePurchaseClient(props: {
        id: number;
        businessId: number;
        updateData: TPurchaseClientSchema;
    }): Promise<{
        success: boolean;
        error: string;
        errors: z.core.$ZodFlattenedError<{
            id: number;
            businessId: number;
            updateData: {
                name: string;
                email: string;
                isActive: boolean;
                createdAt?: Date;
                updatedAt?: Date;
                address?: string;
                country?: string;
                state?: string;
                city?: string;
                phone?: string;
                postalCode?: string;
                contactPerson?: string;
                taxId?: string;
                paymentTerms?: string;
            };
        }, string>;
    } | {
        success: boolean;
        error?: undefined;
        errors?: undefined;
    } | {
        success: boolean;
        error: string;
        errors?: undefined;
    }>;
    archivePurchaseClient(props: {
        id: number;
        businessId: number;
        isActive: boolean;
    }): Promise<{
        success: boolean;
        error: string;
        errors: z.core.$ZodFlattenedError<{
            businessId: number;
            id: number;
            isActive: boolean;
        }, string>;
    } | {
        success: boolean;
        error?: undefined;
        errors?: undefined;
    } | {
        success: boolean;
        error: string;
        errors?: undefined;
    }>;
    searchClients(props: {
        businessId: number;
        searchTerm: string;
        limit: number;
    }): Promise<{
        success: boolean;
        error: z.core.$ZodFlattenedError<{
            businessId: number;
            limit: number;
            searchTerm?: string;
        }, string>;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            name: string;
            id: number;
            createdAt: Date;
            email: string;
            updatedAt: Date;
            isActive: boolean;
            businessId: number;
            address: string | null;
            country: string | null;
            state: string | null;
            city: string | null;
            phone: string | null;
            postalCode: string | null;
            contactPerson: string | null;
            taxId: string | null;
            paymentTerms: string | null;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
}
declare const _default: PurchaseClientService;
export default _default;
//# sourceMappingURL=purchase-client.service.d.ts.map