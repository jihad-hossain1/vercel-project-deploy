import express from "express";
import customerController from "../controllers/customer.controller";
const router = express.Router();

// Customer CRUD routes
router.post("/", customerController.createCustomer);
router.get("/business", customerController.getCustomerById);
router.put("/business/:id", customerController.updateCustomer);
// router.delete('/business/:id', customerController.deleteCustomer);

// Business-specific customer routes
router.get("/business/:businessId", customerController.getCustomersByBusiness);
router.get("/business/:businessId/search", customerController.searchCustomers);
router.put(
  "/business/:businessId/:customerId",
  customerController.archiveCustomer
);
router.get("/search/business/:businessId", customerController.searchCustomers);

// Customer analytics routes
router.get(
  "/analytics/:businessId/:customerId",
  customerController.customerSalesAnalytics
);

export default router;
