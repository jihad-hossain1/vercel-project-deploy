"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const controllers_1 = require("../controllers");
const router = express_1.default.Router();
router.post("/", controllers_1.purchaseClientController.createPurchaseClient);
router.get("/business/:businessId/:id", controllers_1.purchaseClientController.getBusinessPurchaseClient);
router.put("/business/:businessId/:id", controllers_1.purchaseClientController.updatePurchaseClient);
router.get("/business/:businessId", controllers_1.purchaseClientController.getPurchaseClientsByBusiness);
router.put("/archive/business/:businessId/:id", controllers_1.purchaseClientController.archivePurchaseClient);
router.get("/search/business/:businessId", controllers_1.purchaseClientController.searchClients);
exports.default = router;
//# sourceMappingURL=purchase-client.route.js.map