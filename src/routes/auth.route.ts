import express from "express";
import authController from "../controllers/auth.controller";
const router = express.Router();

// Auth routes
router.post("/register", authController.register);
router.post("/verify", authController.verify);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/verify-code", authController.verifyCode);
router.post("/confirm-password", authController.confirmPassword);
router.post("/apply-activation", authController.applyForActivation);
router.get("/user-activate/:email", authController.userActivate);

export default router;
