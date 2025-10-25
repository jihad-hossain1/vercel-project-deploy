"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const router = express_1.default.Router();
router.post("/", controllers_1.purchaseController.createPurchase);
router.put("/business/:businessId/:id", controllers_1.purchaseController.updatePurchase);
router.get("/business/:businessId", controllers_1.purchaseController.getPurchasesByBusiness);
router.get("/business/:businessId/:id", controllers_1.purchaseController.getPurchaseById);
exports.default = router;
//# sourceMappingURL=purchase.route.js.map