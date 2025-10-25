"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
const router = express_1.default.Router();
router.post("/register", auth_controller_1.default.register);
router.post("/verify", auth_controller_1.default.verify);
router.post("/login", auth_controller_1.default.login);
router.post("/forgot-password", auth_controller_1.default.forgotPassword);
router.post("/verify-code", auth_controller_1.default.verifyCode);
router.post("/confirm-password", auth_controller_1.default.confirmPassword);
router.post("/apply-activation", auth_controller_1.default.applyForActivation);
router.get("/user-activate/:email", auth_controller_1.default.userActivate);
exports.default = router;
//# sourceMappingURL=auth.route.js.map