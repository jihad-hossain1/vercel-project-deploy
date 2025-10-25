declare class InventoryService {
    updateProductInventory(props: {
        products: {
            itemId: number;
            qty: number;
            unitPrice: number;
            costPrice: number;
        }[];
        businessId: number;
    }): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    updateStockMovement(props: {
        products: {
            itemId: number;
            quantity: number;
            movementType: "IN" | "OUT";
        }[];
        businessId: number;
        userId: number;
        purchaseId?: number;
        saleId?: number;
    }): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
}
declare const _default: InventoryService;
export default _default;
//# sourceMappingURL=inventory.service.d.ts.map