"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const log_service_1 = __importDefault(require("../service/log.service"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const jose_1 = require("jose");
class JWTService {
    constructor() {
        this.secret = new TextEncoder().encode(process.env.JWT_SECRET);
    }
    async verifyToken(token) {
        try {
            const { payload } = await (0, jose_1.jwtVerify)(token, this.secret, {
                algorithms: ["HS256"],
            });
            return payload;
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_1.default.error({
                    message: `Token verification failed: ${error.message}`,
                    stack: error.stack,
                    error: error,
                    path: "JWTService.verifyToken",
                });
            }
            return null;
        }
    }
    async verify(token) {
        return await this.verifyToken(token);
    }
}
exports.default = new JWTService();
//# sourceMappingURL=jwt.service.js.map