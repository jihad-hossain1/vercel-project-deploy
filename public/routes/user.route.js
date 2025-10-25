"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = __importDefault(require("../controllers/user.controller"));
const router = express_1.default.Router();
router.post("/", user_controller_1.default.createUser);
router.get("/", user_controller_1.default.getAllUsers);
router.get("/:id", user_controller_1.default.getUserById);
router.put("/:businessId/:userId", user_controller_1.default.updateUser);
router.put("/business/profile/:userId", user_controller_1.default.updateUserProfile);
router.delete("/:id", user_controller_1.default.deleteUser);
router.get("/health/check", user_controller_1.default.healthCheck);
exports.default = router;
//# sourceMappingURL=user.route.js.map