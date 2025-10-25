"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const item_controller_1 = __importDefault(require("../controllers/item.controller"));
const router = express_1.default.Router();
router.post("/", item_controller_1.default.createItem);
router.get("/business", item_controller_1.default.getItemById);
router.put("/business/:id", item_controller_1.default.updateItem);
router.get("/business/:businessId", item_controller_1.default.getItemsByBusiness);
router.put("/business/:businessId/:itemId", item_controller_1.default.archiveItem);
router.get("/search/business/:businessId", item_controller_1.default.searchItems);
router.get("/analysis/business/:businessId", item_controller_1.default.itemAnalysis);
router.get("/sales/business/:businessId/:itemId", item_controller_1.default.itemSalesHistory);
exports.default = router;
//# sourceMappingURL=item.route.js.map