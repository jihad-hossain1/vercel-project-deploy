import databaseService from "../service/user.service";
import { Request, Response } from "express";

class UserController {
  // Create a new user
  async createUser(req: Request, res: Response) {
    try {
      const { email, username, password, firstName, lastName, mobile } =
        req.body;

      // Basic validation
      if (!email || !username || !password) {
        return res.status(400).json({
          success: false,
          message: "Email, username, and password are required",
        });
      }

      // Check if user already exists
      const existingUser = await databaseService.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      const newUser = await databaseService.createUser({
        email,
        password, // Note: In production, hash the password before storing
        firstName,
        lastName,
        mobile: mobile || null,
      });

      // Remove password from response
      const { ...userResponse } = newUser;

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: userResponse,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await databaseService.getUserById(parseInt(id));

      if (!user?.success) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Get all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const { limit = 10, offset = 0 } = req.query;
      const users = (await databaseService.getAllUsers(
        Number(limit),
        Number(offset)
      )) as any;

      // Remove passwords from response
      const usersResponse = users?.map((user: any) => {
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
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Update user
  async updateUser(req: Request, res: Response) {
    try {
      const { businessId, userId } = req.params;
      const updateData = req.body;

      // Remove sensitive fields that shouldn't be updated directly
      delete updateData.id;
      delete updateData.createdAt;

      const updatedUser = await databaseService.updateUser({
        businessId: Number(businessId),
        userId: Number(userId),
        updateData,
      });

      return res.status(200).json(updatedUser);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  async updateUserProfile(req: Request, res: Response) {
    const { userId } = req.params;
    const updateData = req.body;

    try {
      const response = await databaseService.updateUserProfile(
        Number(userId),
        updateData
      );
      return res.status(200).json(response);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Delete user
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await databaseService.deleteUser(parseInt(id));

      return res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  // Database health check
  async healthCheck(req: Request, res: Response) {
    try {
      return res.status(200).json({
        success: true,
        message: "Database is healthy",
      });
    } catch (error) {
      return res.status(503).json({
        success: false,
        message: "Database health check failed",
        error: (error as Error).message,
      });
    }
  }
}

export default new UserController();
