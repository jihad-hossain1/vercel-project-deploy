import prisma from "../lib/prisma";
import LogService from "../service/log.service";
import { userProfileSchema, updateUserSchema, userSchema, TUserProfileSchema, TUserSchema } from "../helpers/validate";
import logService from "../service/log.service";
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

class UserService {
    // User operations
    async createUser(userData: UserCreateInput): Promise<ServiceResponse> {
        const safeParse = userSchema.safeParse(userData);

        if (!safeParse.success) {
            return {
                success: false,
                error: safeParse.error.flatten(),
            };
        }

        try {
            const newUser = await prisma.users.create({
                data: safeParse.data as any,
            });

            return {
                success: true,
                data: newUser,
            };
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
                    source: "user-service",
                    message: "Create user failed",
                    details: error.message,
                    context: { email: userData.email },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            return {
                success: false,
                error: "Failed to create user: Unknown error",
            };
        }
    }

    async getUserById(id: number): Promise<ServiceResponse> {
        try {
            const user = (await prisma.$queryRaw`
        SELECT * FROM users
        WHERE id = ${id}  
      `) as unknown as any[];

            const userProfile = (await prisma.$queryRaw`
        SELECT * FROM user_profile
        WHERE userId = ${id}  
      `) as unknown as TUserProfileSchema[];

            const userBusiness = (await prisma.$queryRaw`
        SELECT isStockManaged
        FROM business 
        WHERE id = ${user[0]?.businessId}  
      `) as unknown as any[];

            if (!user || user.length === 0) {
                return {
                    success: false,
                    message: "User not found",
                };
            }

            return {
                success: true,
                data: {
                    users: user[0],
                    user_profile: userProfile[0],
                    business: userBusiness[0],
                },
            };
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
                    source: "user-service",
                    message: "Get user by id failed",
                    details: error.message,
                    context: { id },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            return {
                success: false,
                error: "Failed to get user: Unknown error",
            };
        }
    }

    async getUserByEmail(email: string): Promise<ServiceResponse> {
        try {
            const user = await prisma.users.findUnique({
                where: { email },
            });

            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                };
            }

            return {
                success: true,
                data: user,
            };
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
                    source: "user-service",
                    message: "Get user by email failed",
                    details: error.message,
                    context: { email },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            return {
                success: false,
                error: "Failed to get user by email: Unknown error",
            };
        }
    }

    async updateUser(props: UpdateUserProps): Promise<ServiceResponse> {
        const { userId, businessId, updateData } = props;
        const validateSchema = updateUserSchema.safeParse(updateData);

        if (!validateSchema.success) {
            return {
                success: false,
                error: validateSchema.error.flatten(),
            };
        }

        try {
            const { firstName, lastName, mobile } = validateSchema.data;

            const updatedUser = await prisma.users.update({
                where: {
                    id: userId,
                    businessId,
                },
                data: {
                    firstName,
                    lastName,
                    mobile,
                    updatedAt: new Date(),
                },
            });

            return {
                success: true,
                data: updatedUser,
            };
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
                    source: "user-service",
                    message: "Update user failed",
                    details: error.message,
                    context: { userId, businessId },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            return {
                success: false,
                error: "Failed to update user: Unknown error",
            };
        }
    }

    async updateUserProfile(userId: number, updateData: UserProfileInput): Promise<ServiceResponse> {
        const validateSchema = userProfileSchema.safeParse(updateData);

        if (!validateSchema.success) {
            return {
                success: false,
                error: validateSchema.error.flatten(),
            };
        }

        try {
            await prisma.user_profile.update({
                where: { userId },
                data: {
                    about: validateSchema.data.about || undefined,
                    contactNumber: validateSchema.data.contactNumber || undefined,
                    contactEmail: validateSchema.data.contactEmail || undefined,
                    website: validateSchema.data.website || undefined,
                    organization: validateSchema.data.organization || undefined,
                    avatar: validateSchema.data.avatar || undefined,
                    state: validateSchema.data.state || undefined,
                    address: validateSchema.data.address || undefined,
                    city: validateSchema.data.city || undefined,
                    country: validateSchema.data.country || undefined,

                    updatedAt: new Date(),
                },
            });

            return {
                success: true,
            };
        } catch (error) {
            LogService.error({
                source: "user-service",
                message: "Update user profile failed",
                details: error.message,
                context: { userId },
            });
            return {
                success: false,
                error: error.message,
            };
        }
    }

    async deleteUser(id: number): Promise<ServiceResponse> {
        try {
            await prisma.users.delete({
                where: { id },
            });
            return { success: true };
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
                    source: "user-service",
                    message: "Delete user failed",
                    details: error.message,
                    context: { id },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            return {
                success: false,
                error: "Failed to delete user: Unknown error",
            };
        }
    }

    async getAllUsers(limit = 10, offset = 0): Promise<ServiceResponse> {
        try {
            const [users, total] = await prisma.$transaction([
                prisma.users.findMany({
                    take: limit,
                    skip: offset,
                    orderBy: { createdAt: "desc" },
                }),
                prisma.users.count(),
            ]);

            return {
                success: true,
                data: {
                    users,
                    pagination: {
                        total,
                        limit,
                        offset,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            };
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
                    source: "user-service",
                    message: "Get all users failed",
                    details: error.message,
                    context: { limit, offset },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            return {
                success: false,
                error: "Failed to get users: Unknown error",
            };
        }
    }

    async createUserProfile(profileData: UserProfileInput): Promise<ServiceResponse> {
        const validateSchema = userProfileSchema.safeParse(profileData);
        if (!validateSchema.success) {
            return {
                success: false,
                error: validateSchema.error.flatten(),
            };
        }

        try {
            const newProfile = await prisma.user_profile.create({
                data: validateSchema.data,
            });

            return {
                success: true,
                data: newProfile,
            };
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
                    source: "user-service",
                    message: "Create user profile failed",
                    details: error.message,
                    context: { userId: profileData.userId },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            return {
                success: false,
                error: "Failed to create user profile: Unknown error",
            };
        }
    }

    async getUserProfileByUserId(userId: number): Promise<ServiceResponse> {
        try {
            const profile = await prisma.user_profile.findUnique({
                where: { userId },
            });

            if (!profile) {
                return {
                    success: false,
                    message: "User profile not found",
                };
            }

            return {
                success: true,
                data: profile,
            };
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
                    source: "user-service",
                    message: "Get user profile failed",
                    details: error.message,
                    context: { userId },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            return {
                success: false,
                error: "Failed to get user profile: Unknown error",
            };
        }
    }

    async getUsersWithProfiles(limit = 10, offset = 0): Promise<ServiceResponse> {
        try {
            const [usersWithProfiles, total] = await prisma.$transaction([
                prisma.users.findMany({
                    include: {
                        profile: true,
                        business: true,
                    },
                    take: limit,
                    skip: offset,
                    orderBy: { createdAt: "desc" },
                }),
                prisma.users.count(),
            ]);

            return {
                success: true,
                data: {
                    users: usersWithProfiles,
                    pagination: {
                        total,
                        limit,
                        offset,
                        totalPages: Math.ceil(total / limit),
                    },
                },
            };
        } catch (error) {
            if (error instanceof Error) {
                logService.error({
                    source: "user-service",
                    message: "Get users with profiles failed",
                    details: error.message,
                    context: { limit, offset },
                });
                return {
                    success: false,
                    error: error.message,
                };
            }
            return {
                success: false,
                error: "Failed to get users with profiles: Unknown error",
            };
        }
    }
}

export default new UserService();
