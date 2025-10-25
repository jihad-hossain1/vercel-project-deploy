"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = exports.notFoundHandler = void 0;
const http_status_1 = __importDefault(require("http-status"));
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Not Found",
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API Not Found",
            },
        ],
    });
    next();
};
exports.notFoundHandler = notFoundHandler;
const globalErrorHandler = (err, req, res, next) => {
    console.error('Global error:', err);
    res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal Server Error",
        errorMessages: [
            {
                path: req.originalUrl,
                message: process.env.NODE_ENV === 'development' ? err.message : "Something went wrong",
            },
        ],
    });
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=errorhandler.js.map