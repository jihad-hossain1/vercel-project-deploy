"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcrypt_1 = __importDefault(require("bcrypt"));
const log_service_1 = __importDefault(require("../service/log.service"));
class UtilsService {
    randomString(length) {
        return Math.random()
            .toString(36)
            .substring(2, length + 2);
    }
    randomNumber(length = 6) {
        return Math.floor(Math.random() * 10 ** length);
    }
    jsonToObject(jsonString) {
        try {
            return JSON.parse(jsonString);
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_1.default.error({
                    source: "utils-service",
                    message: "Failed to parse JSON string",
                    details: error.message,
                    context: { jsonString },
                });
            }
            else {
                log_service_1.default.error({
                    source: "utils-service",
                    message: "Failed to parse JSON string with unknown error",
                    context: { jsonString },
                });
            }
            return null;
        }
    }
    objectToJson(obj) {
        try {
            return JSON.stringify(obj);
        }
        catch (error) {
            if (error instanceof Error) {
                log_service_1.default.error({
                    source: "utils-service",
                    message: "Failed to stringify object",
                    details: error.message,
                    context: { object: obj },
                });
            }
            else {
                log_service_1.default.error({
                    source: "utils-service",
                    message: "Failed to stringify object with unknown error",
                    context: { object: obj },
                });
            }
            return null;
        }
    }
    passwordEncrypt(password) {
        const salt = bcrypt_1.default.genSaltSync(10);
        return bcrypt_1.default.hashSync(password, salt);
    }
    passwordDecrypt(password, hash) {
        return bcrypt_1.default.compareSync(password, hash);
    }
}
exports.default = new UtilsService();
//# sourceMappingURL=utils.service.js.map