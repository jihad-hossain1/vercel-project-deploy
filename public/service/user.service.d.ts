import { userProfileSchema, updateUserSchema, userSchema } from "../helpers/validate";
import { z } from "zod";
type UserCreateInput = z.infer<typeof userSchema>;
type UserUpdateInput = z.infer<typeof updateUserSchema>;
type UserProfileInput = z.infer<typeof userProfileSchema>;
interface UpdateUserProps {
    userId: number;
    businessId: number;
    updateData: UserUpdateInput;
}
interface ErrorResponse {
    success: false;
    error?: unknown;
    message?: string;
}
interface SuccessResponse<T = unknown> {
    success: true;
    data?: T;
    message?: string;
}
type ServiceResponse<T = unknown> = ErrorResponse | SuccessResponse<T>;
declare class UserService {
    createUser(userData: UserCreateInput): Promise<ServiceResponse>;
    getUserById(id: number): Promise<ServiceResponse>;
    getUserByEmail(email: string): Promise<ServiceResponse>;
    updateUser(props: UpdateUserProps): Promise<ServiceResponse>;
    updateUserProfile(userId: number, updateData: UserProfileInput): Promise<ServiceResponse>;
    deleteUser(id: number): Promise<ServiceResponse>;
    getAllUsers(limit?: number, offset?: number): Promise<ServiceResponse>;
    createUserProfile(profileData: UserProfileInput): Promise<ServiceResponse>;
    getUserProfileByUserId(userId: number): Promise<ServiceResponse>;
    getUsersWithProfiles(limit?: number, offset?: number): Promise<ServiceResponse>;
}
declare const _default: UserService;
export default _default;
//# sourceMappingURL=user.service.d.ts.map