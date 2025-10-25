"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const department_controller_1 = __importDefault(require("../controllers/department.controller"));
router.post("/business", department_controller_1.default.create);
router.get("/business", department_controller_1.default.get);
router.get("/business/:id", department_controller_1.default.getById);
router.patch("/business/:id", department_controller_1.default.update);
exports.default = router;
//# sourceMappingURL=department.route.js.map