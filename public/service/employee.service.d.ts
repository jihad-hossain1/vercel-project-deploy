declare class EmployeeService {
    createEmployee(employeeData: any): Promise<{
        success: boolean;
        error: import("zod").ZodFlattenedError<{
            userName: string;
            email: string;
            businessId: number;
            password: string;
            departmentName: string;
            isActive: boolean;
            id?: number;
            empCode?: string;
            mobile?: string;
            departmentId?: number;
            hireDate?: string | Date;
            createdAt?: Date;
            rolePermission?: import("zod/v4/core/util.cjs").JSONType;
        }, string>;
    } | {
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
    getEmployeeById({ id, businessId }: {
        id: any;
        businessId: any;
    }): Promise<{
        success: boolean;
        data: {
            id: number;
            createdAt: Date;
            email: string;
            updatedAt: Date;
            mobile: string | null;
            isActive: boolean;
            password: string;
            businessId: number;
            userName: string;
            empCode: string;
            departmentId: number | null;
            departmentName: string;
            hireDate: Date;
            rolePermission: import("generated/prisma/runtime/library").JsonValue | null;
        };
        error?: undefined;
    } | {
        success: boolean;
        error: string;
        data?: undefined;
    }>;
    getEmployeesByBusiness(props: {
        businessId: number;
        page?: number;
        limit?: number;
        offset?: number;
        query?: string;
    }): Promise<{
        success: boolean;
        data: {
            id: number;
            createdAt: Date;
            email: string;
            updatedAt: Date;
            mobile: string | null;
            isActive: boolean;
            password: string;
            businessId: number;
            userName: string;
            empCode: string;
            departmentId: number | null;
            departmentName: string;
            hireDate: Date;
            rolePermission: import("generated/prisma/runtime/library").JsonValue | null;
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
    updateEmployee(id: number, updateData: any): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: string;
    }>;
}
declare const _default: EmployeeService;
export default _default;
//# sourceMappingURL=employee.service.d.ts.map