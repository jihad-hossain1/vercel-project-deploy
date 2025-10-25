"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_service_1 = __importDefault(require("../service/user.service"));
class UserController {
    async createUser(req, res) {
        try {
            const { email, username, password, firstName, lastName, mobile } = req.body;
            if (!email || !username || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email, username, and password are required",
                });
            }
            const existingUser = await user_service_1.default.getUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: "User with this email already exists",
                });
            }
            const newUser = await user_service_1.default.createUser({
                email,
                password,
                firstName,
                lastName,
                mobile: mobile || null,
            });
            const { ...userResponse } = newUser;
            return res.status(201).json({
                success: true,
                message: "User created successfully",
                data: userResponse,
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getUserById(req, res) {
        try {
            const { id } = req.params;
            const user = await user_service_1.default.getUserById(parseInt(id));
            if (!user?.success) {
                return res.status(404).json({
                    success: false,
                    message: "User not found",
                });
            }
            return res.status(200).json(user);
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async getAllUsers(req, res) {
        try {
            const { limit = 10, offset = 0 } = req.query;
            const users = (await user_service_1.default.getAllUsers(Number(limit), Number(offset)));
            const usersResponse = users?.map((user) => {
                const { password: _, ...userWithoutPassword } = user;
                return userWithoutPassword;
            });
            return res.status(200).json({
                success: true,
                data: usersResponse,
                pagination: {
                    limit: Number(limit),
                    offset: Number(offset),
                },
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async updateUser(req, res) {
        try {
            const { businessId, userId } = req.params;
            const updateData = req.body;
            delete updateData.id;
            delete updateData.createdAt;
            const updatedUser = await user_service_1.default.updateUser({
                businessId: Number(businessId),
                userId: Number(userId),
                updateData,
            });
            return res.status(200).json(updatedUser);
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async updateUserProfile(req, res) {
        const { userId } = req.params;
        const updateData = req.body;
        try {
            const response = await user_service_1.default.updateUserProfile(Number(userId), updateData);
            return res.status(200).json(response);
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async deleteUser(req, res) {
        try {
            const { id } = req.params;
            await user_service_1.default.deleteUser(parseInt(id));
            return res.status(200).json({
                success: true,
                message: "User deleted successfully",
            });
        }
        catch (error) {
            return res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    async healthCheck(req, res) {
        try {
            return res.status(200).json({
                success: true,
                message: "Database is healthy",
            });
        }
        catch (error) {
            return res.status(503).json({
                success: false,
                message: "Database health check failed",
                error: error.message,
            });
        }
    }
}
exports.default = new UserController();
//# sourceMappingURL=user.controller.js.map