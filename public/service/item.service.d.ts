declare class ItemService {
    createItem(itemData: any): Promise<{
        success: boolean;
        errors?: any;
        error?: string;
    }>;
    getItemsByBusiness(props: {
        businessId: number;
        page?: number;
        limit?: number;
        offset?: number;
        query?: string;
    }): Promise<{
        success: boolean;
        errors?: any;
        error?: string;
        data?: any;
        pagination?: {
            totalPages: number;
        };
    }>;
    getItemById(props: {
        itemId: number;
        businessId: number;
    }): Promise<{
        success: boolean;
        errors?: any;
        error?: string;
        data?: any;
    }>;
    updateItem(props: {
        itemId: number;
        businessId: number;
        updateData: any;
    }): Promise<{
        success: boolean;
        errors?: any;
        error?: string;
        message?: string;
    }>;
    archiveItem(props: {
        businessId: number;
        itemId: number;
        isActive: boolean;
    }): Promise<{
        success: boolean;
        errors?: any;
        error?: string;
        message?: string;
    }>;
    deleteItem(props: {
        businessId: number;
        itemId: number;
    }): Promise<{
        success: boolean;
        errors?: any;
        error?: string;
        message?: string;
    }>;
    searchItems(props: {
        businessId: number;
        searchTerm: string;
        limit: number;
    }): Promise<{
        success: boolean;
        errors?: any;
        error?: any;
        data?: any;
    }>;
    itemAnalysis(props: {
        businessId: number;
        searchTerm?: string;
        page?: number;
        limit?: number;
        fromDate?: string;
        toDate?: string;
    }): Promise<{
        success: boolean;
        errors?: any;
        error?: string;
        data?: any;
        message?: string;
    }>;
    itemSalesHistory(props: {
        businessId: number;
        itemId: number;
        page?: number;
        limit?: number;
        fromDate?: string;
        toDate?: string;
        searchTerm: string;
    }): Promise<{
        success: boolean;
        errors?: any;
        error?: string;
        data?: any;
        message?: string;
    }>;
}
declare const _default: ItemService;
export default _default;
//# sourceMappingURL=item.service.d.ts.map