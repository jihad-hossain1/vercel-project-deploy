"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controllers_1 = require("../controllers");
router.post("/", controllers_1.codesController.create);
router.get("/", controllers_1.codesController.get);
router.patch("/business/:codeId", controllers_1.codesController.update);
router.put("/business/:businessId/:id", controllers_1.codesController.archive);
router.get("/business/search/:businessId", controllers_1.codesController.searchCodes);
exports.default = router;
//# sourceMappingURL=codes.route.js.map