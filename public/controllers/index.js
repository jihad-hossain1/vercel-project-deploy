"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardController = exports.codesController = exports.authController = exports.purchaseController = exports.purchaseClientController = exports.businessController = exports.invoiceController = exports.itemController = exports.customerController = exports.userController = void 0;
const user_controller_1 = __importDefault(require("./user.controller"));
exports.userController = user_controller_1.default;
const customer_controller_1 = __importDefault(require("./customer.controller"));
exports.customerController = customer_controller_1.default;
const item_controller_1 = __importDefault(require("./item.controller"));
exports.itemController = item_controller_1.default;
const invoice_controller_1 = __importDefault(require("./invoice.controller"));
exports.invoiceController = invoice_controller_1.default;
const business_controller_1 = __importDefault(require("./business.controller"));
exports.businessController = business_controller_1.default;
const purchase_client_controller_1 = __importDefault(require("./purchase-client.controller"));
exports.purchaseClientController = purchase_client_controller_1.default;
const purchase_controller_1 = __importDefault(require("./purchase.controller"));
exports.purchaseController = purchase_controller_1.default;
const auth_controller_1 = __importDefault(require("./auth.controller"));
exports.authController = auth_controller_1.default;
const codes_controller_1 = __importDefault(require("./codes.controller"));
exports.codesController = codes_controller_1.default;
const dashboard_controller_1 = __importDefault(require("./dashboard.controller"));
exports.dashboardController = dashboard_controller_1.default;
//# sourceMappingURL=index.js.map