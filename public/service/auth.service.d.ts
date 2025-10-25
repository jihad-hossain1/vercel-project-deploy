import { TUserSchema } from "../helpers/validate";
declare class AuthService {
    register({ email, jsonData }: {
        email: string;
        jsonData: TUserSchema;
    }): Promise<{
        success: boolean;
        error?: any;
    }>;
    verify({ email, code }: {
        email: string;
        code: string;
    }): Promise<{
        success: boolean;
        error?: any;
    }>;
    login({ email, password }: {
        email: string;
        password: string;
    }): Promise<{
        success: boolean;
        error?: any;
        is_active?: boolean;
        not_active?: boolean;
        data?: TUserSchema;
    }>;
    forgotPassword({ email }: {
        email: string;
    }): Promise<{
        success: boolean;
        error?: any;
    }>;
    verifyCode({ email, code }: {
        email: string;
        code: string;
    }): Promise<{
        success: boolean;
        error?: any;
    }>;
    confirmPassword({ email, password }: {
        email: string;
        password: string;
    }): Promise<{
        success: boolean;
        error?: any;
    }>;
    applyForActivation({ email }: {
        email: string;
    }): Promise<{
        success: boolean;
        error?: any;
        message?: string;
    }>;
    userActivate({ email }: {
        email: string;
    }): Promise<{
        success: boolean;
        error?: any;
        message?: string;
    }>;
    deactivateUser({ email }: {
        email: string;
    }): Promise<{
        success: boolean;
        error?: any;
        message?: string;
    }>;
}
declare const _default: AuthService;
export default _default;
//# sourceMappingURL=auth.service.d.ts.map