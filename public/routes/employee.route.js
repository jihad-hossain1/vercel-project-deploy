"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const employee_controller_1 = __importDefault(require("../controllers/employee.controller"));
const router = express_1.default.Router();
router.post("/business", employee_controller_1.default.createEmployee);
router.get("/business", employee_controller_1.default.getEmployeesByBusiness);
router.get("/business/:id", employee_controller_1.default.getEmployeeById);
router.put("/business/:id", employee_controller_1.default.updateEmployee);
exports.default = router;
//# sourceMappingURL=employee.route.js.map