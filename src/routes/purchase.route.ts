import express from "express";
import { purchaseController } from "../controllers";

const router = express.Router();

// Create a new purchase
router.post("/", purchaseController.createPurchase);

// update purchase
router.put("/business/:businessId/:id", purchaseController.updatePurchase);

// Get purchases by business
router.get("/business/:businessId", purchaseController.getPurchasesByBusiness);

// Get a purchase by ID
router.get("/business/:businessId/:id", purchaseController.getPurchaseById);

export default router;
