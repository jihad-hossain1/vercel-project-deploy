"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
class LogService {
    async _write(logType, data) {
        const { source, message, details = null, context = null, metadata = null, } = data;
        if (!source || !message) {
            throw new Error("Missing required fields: source and message");
        }
        try {
            const logEntry = await prisma_1.default.logs.create({
                data: {
                    logType,
                    source,
                    message,
                    details,
                    context,
                    metadata,
                }
            });
            return logEntry;
        }
        catch (error) {
            console.error(`[LogService] Failed to log ${logType}:`, error);
            throw error;
        }
    }
    info(data) {
        return this._write("INFO", data);
    }
    error(data) {
        return this._write("ERROR", data);
    }
    warn(data) {
        return this._write("WARNING", data);
    }
    debug(data) {
        return this._write("DEBUG", data);
    }
}
const logService = new LogService();
exports.default = {
    info: logService.info.bind(logService),
    error: logService.error.bind(logService),
    warn: logService.warn.bind(logService),
    debug: logService.debug.bind(logService)
};
//# sourceMappingURL=log.service.js.map