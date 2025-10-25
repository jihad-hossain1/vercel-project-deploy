"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customer_controller_1 = __importDefault(require("../controllers/customer.controller"));
const router = express_1.default.Router();
router.post("/", customer_controller_1.default.createCustomer);
router.get("/business", customer_controller_1.default.getCustomerById);
router.put("/business/:id", customer_controller_1.default.updateCustomer);
router.get("/business/:businessId", customer_controller_1.default.getCustomersByBusiness);
router.get("/business/:businessId/search", customer_controller_1.default.searchCustomers);
router.put("/business/:businessId/:customerId", customer_controller_1.default.archiveCustomer);
router.get("/search/business/:businessId", customer_controller_1.default.searchCustomers);
router.get("/analytics/:businessId/:customerId", customer_controller_1.default.customerSalesAnalytics);
exports.default = router;
//# sourceMappingURL=customer.route.js.map