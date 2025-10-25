import express from "express";
import userController from "../controllers/user.controller";
const router = express.Router();

// User CRUD routes
router.post("/", userController.createUser);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:businessId/:userId", userController.updateUser);
router.put("/business/profile/:userId", userController.updateUserProfile);
router.delete("/:id", userController.deleteUser);

// Health check route
router.get("/health/check", userController.healthCheck);

export default router;
