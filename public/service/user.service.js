"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const log_service_1 = __importDefault(require("../service/log.service"));
const validate_1 = require("../helpers/validate");
const log_service_2 = __importDefault(require("../service/log.service"));
class UserService {
    async createUser(userData) {
        const safeParse = validate_1.userSchema.safeParse(userData);
        if (!safeParse.success) {
            return {
                success: false,
                error: safeParse.error.flatten(),
            };
        }
        try {
            const newUser = await prisma_1.default.users.create({
                data: safeParse.data,
            });
            return {
                success: true,
                data: newUser,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_2.default.error({
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
    async getUserById(id) {
        try {
            const user = (await prisma_1.default.$queryRaw `
        SELECT * FROM users
        WHERE id = ${id}  
      `);
            const userProfile = (await prisma_1.default.$queryRaw `
        SELECT * FROM user_profile
        WHERE userId = ${id}  
      `);
            const userBusiness = (await prisma_1.default.$queryRaw `
        SELECT isStockManaged
        FROM business 
        WHERE id = ${user[0]?.businessId}  
      `);
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
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_2.default.error({
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
    async getUserByEmail(email) {
        try {
            const user = await prisma_1.default.users.findUnique({
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
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_2.default.error({
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
    async updateUser(props) {
        const { userId, businessId, updateData } = props;
        const validateSchema = validate_1.updateUserSchema.safeParse(updateData);
        if (!validateSchema.success) {
            return {
                success: false,
                error: validateSchema.error.flatten(),
            };
        }
        try {
            const { firstName, lastName, mobile } = validateSchema.data;
            const updatedUser = await prisma_1.default.users.update({
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
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_2.default.error({
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
    async updateUserProfile(userId, updateData) {
        const validateSchema = validate_1.userProfileSchema.safeParse(updateData);
        if (!validateSchema.success) {
            return {
                success: false,
                error: validateSchema.error.flatten(),
            };
        }
        try {
            await prisma_1.default.user_profile.update({
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
        }
        catch (error) {
            log_service_1.default.error({
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
    async deleteUser(id) {
        try {
            await prisma_1.default.users.delete({
                where: { id },
            });
            return { success: true };
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_2.default.error({
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
    async getAllUsers(limit = 10, offset = 0) {
        try {
            const [users, total] = await prisma_1.default.$transaction([
                prisma_1.default.users.findMany({
                    take: limit,
                    skip: offset,
                    orderBy: { createdAt: "desc" },
                }),
                prisma_1.default.users.count(),
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
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_2.default.error({
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
    async createUserProfile(profileData) {
        const validateSchema = validate_1.userProfileSchema.safeParse(profileData);
        if (!validateSchema.success) {
            return {
                success: false,
                error: validateSchema.error.flatten(),
            };
        }
        try {
            const newProfile = await prisma_1.default.user_profile.create({
                data: validateSchema.data,
            });
            return {
                success: true,
                data: newProfile,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_2.default.error({
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
    async getUserProfileByUserId(userId) {
        try {
            const profile = await prisma_1.default.user_profile.findUnique({
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
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_2.default.error({
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
    async getUsersWithProfiles(limit = 10, offset = 0) {
        try {
            const [usersWithProfiles, total] = await prisma_1.default.$transaction([
                prisma_1.default.users.findMany({
                    include: {
                        profile: true,
                        business: true,
                    },
                    take: limit,
                    skip: offset,
                    orderBy: { createdAt: "desc" },
                }),
                prisma_1.default.users.count(),
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
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_2.default.error({
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
exports.default = new UserService();
//# sourceMappingURL=user.service.js.map