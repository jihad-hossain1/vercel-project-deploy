"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_service_1 = __importDefault(require("../service/auth.service"));
class AuthController {
    async register(req, res) {
        try {
            const { email, jsonData } = req.body;
            const newUser = await auth_service_1.default.register({ email, jsonData });
            res.status(201).json(newUser);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async verify(req, res) {
        try {
            const { email, code } = req.body;
            const newUser = await auth_service_1.default.verify({ email, code });
            res.status(201).json(newUser);
        }
        catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async login(req, res) {
        try {
            const jsonData = req.body;
            const user = await auth_service_1.default.login(jsonData);
            res.status(200).json(user);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            const user = await auth_service_1.default.forgotPassword({ email });
            res.status(200).json(user);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async verifyCode(req, res) {
        try {
            const { email, code } = req.body;
            const user = await auth_service_1.default.verifyCode({ email, code });
            res.status(200).json(user);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async confirmPassword(req, res) {
        try {
            const { email, password } = req.body;
            const user = await auth_service_1.default.confirmPassword({ email, password });
            res.status(200).json(user);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async applyForActivation(req, res) {
        try {
            const { email } = req.body;
            const user = await auth_service_1.default.applyForActivation({ email });
            res.status(200).json(user);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
    async userActivate(req, res) {
        try {
            const { email } = req.params;
            const user = await auth_service_1.default.userActivate({ email });
            res.status(200).json(user);
        }
        catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}
exports.default = new AuthController();
//# sourceMappingURL=auth.controller.js.map