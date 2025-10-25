"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const invoice_controller_1 = __importDefault(require("../controllers/invoice.controller"));
const router = express_1.default.Router();
router.post("/", invoice_controller_1.default.createInvoice);
router.get("/business/:businessId", invoice_controller_1.default.getInvoicesByBusiness);
router.put("/business/:businessId/:id", invoice_controller_1.default.updateInvoice);
router.get("/business/:businessId/:id", invoice_controller_1.default.getInvoiceById);
exports.default = router;
//# sourceMappingURL=invoice.route.js.map