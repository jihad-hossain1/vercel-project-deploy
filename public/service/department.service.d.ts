declare class DepartmentService {
    create(requireData: any): Promise<{
        success: boolean;
        error: string;
        errors: import("zod").ZodFlattenedError<{
            name: string;
            businessId: number;
            id?: number;
            deptCode?: string;
            createdAt?: string | Date;
        }, string>;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            businessId: number;
            deptCode: string;
        };
        error?: undefined;
        errors?: undefined;
    } | {
        success: boolean;
        error: any;
        errors?: undefined;
        data?: undefined;
    }>;
    update(id: number, updateData: any): Promise<{
        success: boolean;
        error: string;
        errors: import("zod").ZodFlattenedError<{
            id?: number;
            name?: string;
            deptCode?: string;
            businessId?: number;
            createdAt?: string | Date;
        }, string>;
        data?: undefined;
    } | {
        success: boolean;
        data: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            businessId: number;
            deptCode: string;
        };
        error?: undefined;
        errors?: undefined;
    } | {
        success: boolean;
        error: any;
        errors?: undefined;
        data?: undefined;
    }>;
    get(props: {
        businessId: number;
        page?: number;
        limit?: number;
        offset?: number;
        query?: string;
    }): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            businessId: number;
            deptCode: string;
        }[];
        pagination: {
            page: number;
            limit: number;
            totalPages: number;
            totalCount: number;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
        pagination?: undefined;
    }>;
    getById(id: number): Promise<{
        success: boolean;
        data: {
            name: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            businessId: number;
            deptCode: string;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        data?: undefined;
    }>;
    delete(id: any): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
}
declare const _default: DepartmentService;
export default _default;
//# sourceMappingURL=department.service.d.ts.map