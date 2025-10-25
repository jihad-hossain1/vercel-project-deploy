import express from "express";
import itemController from "../controllers/item.controller";
const router = express.Router();

// Item CRUD routes
router.post("/", itemController.createItem);
router.get("/business", itemController.getItemById);
router.put("/business/:id", itemController.updateItem);
// router.delete("/:id", itemController.deleteItem);

// Business-specific item routes
router.get("/business/:businessId", itemController.getItemsByBusiness);
router.put("/business/:businessId/:itemId", itemController.archiveItem);
router.get("/search/business/:businessId", itemController.searchItems);
// Item analysis routes
router.get("/analysis/business/:businessId", itemController.itemAnalysis);
// Item sales history routes
router.get(
  "/sales/business/:businessId/:itemId",
  itemController.itemSalesHistory
);

export default router;
