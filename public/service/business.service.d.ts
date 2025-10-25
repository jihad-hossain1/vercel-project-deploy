declare class BusinessService {
    getBusinessStats(businessId: number): Promise<{
        business: {
            id: number;
            createdAt: Date;
            email: string;
            updatedAt: Date;
            mobile: string | null;
            isActive: boolean;
            isStockManaged: boolean;
        };
        stats: {
            customerCount: number;
            itemCount: number;
            invoiceCount: number;
            totalRevenue: number;
        };
    }>;
    update(businessId: number, isStockManaged: boolean): Promise<{
        success: boolean;
        message: string;
    }>;
}
declare const _default: BusinessService;
export default _default;
//# sourceMappingURL=business.service.d.ts.map