import { z } from "zod";
declare class CustomerService {
    createCustomer(customerData: any): Promise<{
        success: boolean;
        error: z.core.$ZodFlattenedError<{
            name: string;
            email: string;
            businessId: number;
            id?: number;
            phone?: string;
            cusCode?: string;
            address?: string;
            city?: string;
            state?: string;
            country?: string;
            postalCode?: string;
            isActive?: boolean;
            createdAt?: Date;
            updatedAt?: Date;
        }, string>;
    } | {
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
    getCustomerById(props: {
        customerId: number;
        businessId: number;
    }): Promise<{
        success: boolean;
        data: any;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    getCustomersByBusiness(props: any): Promise<{
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
            cusCode: string;
            postalCode: string | null;
        }[];
        pagination: {
            totalPages: number;
            totalCount: number;
        };
        success?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
        pagination?: undefined;
    }>;
    updateCustomer(id: number, updateData: any): Promise<{
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
            cusCode: string;
            postalCode: string | null;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    archiveCustomer(props: any): Promise<{
        success: boolean;
        error: z.core.$ZodFlattenedError<{
            businessId: number;
            customerId: number;
            isActive: boolean;
        }, string>;
    } | {
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
    deleteCustomer(id: number): Promise<{
        success: boolean;
    }>;
    searchCustomers(props: any): Promise<{
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
            cusCode: string;
            postalCode: string | null;
        }[];
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    customerSalesAnalytics(props: any): Promise<{
        success: boolean;
        data: {
            customer: any;
            totalSales: number;
            invoices: {
                data: unknown;
                totalPages: number;
            };
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
}
declare const _default: CustomerService;
export default _default;
//# sourceMappingURL=customer.service.d.ts.map