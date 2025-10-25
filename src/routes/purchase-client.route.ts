import express from "express";
import { purchaseClientController } from "../controllers";

const router = express.Router();

// Create a new purchase client
router.post("/", purchaseClientController.createPurchaseClient);

// Get all purchase clients with pagination
// router.get("/", purchaseClientController.getAllPurchaseClients);

// Get purchase client by ID
router.get(
  "/business/:businessId/:id",
  purchaseClientController.getBusinessPurchaseClient
);

// Update purchase client
router.put(
  "/business/:businessId/:id",
  purchaseClientController.updatePurchaseClient
);

// Get purchase clients by business
router.get(
  "/business/:businessId",
  purchaseClientController.getPurchaseClientsByBusiness
);

// Archive purchase client
router.put(
  "/archive/business/:businessId/:id",
  purchaseClientController.archivePurchaseClient
);

router.get(
  "/search/business/:businessId",
  purchaseClientController.searchClients
);

export default router;
