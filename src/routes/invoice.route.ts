import express from "express";
import invoiceController from "../controllers/invoice.controller";
const router = express.Router();

// Invoice CRUD routes
router.post("/", invoiceController.createInvoice);

// Business-specific invoice routes
router.get("/business/:businessId", invoiceController.getInvoicesByBusiness);

// Update invoice
router.put("/business/:businessId/:id", invoiceController.updateInvoice);

// get invoice
router.get("/business/:businessId/:id", invoiceController.getInvoiceById);

export default router;
