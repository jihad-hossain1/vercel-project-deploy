declare class DashboardService {
    getDashboardStats(businessId: number): Promise<{
        success: boolean;
        data: {
            id: number;
            customers: number;
            employees: number;
            items: number;
            purchases: number;
            businessId: number;
            invoices: number;
            suppliers: number;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    updateDashboardStats(props: any): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
}
declare const _default: DashboardService;
export default _default;
//# sourceMappingURL=dashboard.service.d.ts.map