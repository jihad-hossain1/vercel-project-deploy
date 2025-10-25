import { Router } from "express";

// Use require for compatibility during transition
import userRoutes from "../routes/user.route";
import customerRoutes from "../routes/customer.route";
import itemRoutes from "../routes/item.route";
import invoiceRoutes from "../routes/invoice.route";
import businessRoutes from "../routes/business.route";
import purchaseClientRoutes from "../routes/purchase-client.route";
import purchaseRoutes from "../routes/purchase.route";
import authRoutes from "../routes/auth.route";
import codesRoutes from "../routes/codes.route";
import departmentRoutes from "../routes/department.route";
import employeeRoutes from "../routes/employee.route";
import dashboardRoutes from "../routes/dashboard.route";
const router = Router();

router.use("/business", businessRoutes);
router.use("/users", userRoutes);
router.use("/customers", customerRoutes);
router.use("/items", itemRoutes);
router.use("/invoices", invoiceRoutes);
router.use("/purchase-clients", purchaseClientRoutes);
router.use("/purchases", purchaseRoutes);
router.use("/auth", authRoutes);
router.use("/codes", codesRoutes);
router.use("/employee", employeeRoutes);
router.use("/departments", departmentRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
