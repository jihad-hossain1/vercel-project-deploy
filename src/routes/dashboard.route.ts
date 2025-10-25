import express from "express";
import dashboardController from "../controllers/dashboard.controller";
const router = express.Router();

router.get("/business/stats", dashboardController.getDashboardStats);

export default router;
