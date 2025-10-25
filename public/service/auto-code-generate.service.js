"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const utils_service_1 = __importDefault(require("../utils/utils.service"));
const log_service_1 = __importDefault(require("./log.service"));
const CODE_PREFIX = {
    CUSTOMER: "CST",
    ITEM: "PRO",
    INVOICE: "SO",
    PURCHASE_ORDER: "PO",
    EMPLOYEE: "EMP",
    DEPARTMENT: "DEP",
};
class AutoCodeGenerateService {
    formattedDatePrefix(prefix) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${prefix}-${year}${month}${day}-`;
    }
    extractNumber(code, prefix) {
        if (!code)
            return 0;
        const numberPart = code.replace(prefix, "").replace(/\D/g, "");
        return parseInt(numberPart) || 0;
    }
    async customerAutoCodeGenerate({ businessId }) {
        const likeQuery = `${CODE_PREFIX.CUSTOMER}%`;
        try {
            const customers = await prisma_1.default.$queryRaw `
        select 
          max(cast(substring_index(cusCode, '-', -1) as unsigned)) as maxNumber
        from customers
        where businessId = ${businessId}
        and cusCode like ${likeQuery}
      `;
            const maxNumber = Number(customers?.[0]?.maxNumber || 0);
            const newItemCode = `${CODE_PREFIX.CUSTOMER}-${maxNumber + 1}`;
            return newItemCode;
        }
        catch (error) {
            log_service_1.default.error({
                source: "auto code generate customer service",
                message: "auto code generate customer service failed",
                details: `${error?.message || "Unknown error"}`,
                context: { businessId },
            });
            return `${CODE_PREFIX.CUSTOMER}-${utils_service_1.default.randomNumber()}`;
        }
    }
    async itemAutoCodeGenerate({ businessId }) {
        const likeQuery = `${CODE_PREFIX.ITEM}%`;
        try {
            const items = await prisma_1.default.$queryRaw `
        select 
          max(cast(substring_index(proCode, '-', -1) as unsigned)) as maxNumber
        from items
        where businessId = ${businessId}
        and proCode like ${likeQuery}
      `;
            const maxNumber = Number(items?.[0]?.maxNumber || 0);
            const newItemCode = `${CODE_PREFIX.ITEM}-${maxNumber + 1}`;
            return newItemCode;
        }
        catch (error) {
            log_service_1.default.error({
                source: "auto code generate item service",
                message: "auto code generate item service failed",
                details: `${error?.message || "Unknown error"}`,
                context: { businessId },
            });
            return `${CODE_PREFIX.ITEM}${utils_service_1.default.randomNumber()}`;
        }
    }
    async invoiceAutoCodeGenerate({ businessId }) {
        try {
            const todayPrefix = this.formattedDatePrefix(CODE_PREFIX.INVOICE);
            const likePattern = `${todayPrefix}%`;
            const result = await prisma_1.default.$queryRaw `
      SELECT 
        COALESCE(MAX(CAST(SUBSTRING_INDEX(invoiceNumber, '-', -1) AS UNSIGNED)), 0) AS maxNumber
      FROM invoice_master
      WHERE businessId = ${businessId}
        AND invoiceNumber LIKE ${likePattern};
      `;
            const maxNumber = Number(result?.[0]?.maxNumber || 0);
            const newInvoiceNumber = `${todayPrefix}${maxNumber + 1}`;
            return newInvoiceNumber;
        }
        catch (error) {
            log_service_1.default.error({
                source: "auto code generate invoice service",
                message: "auto code generate invoice service failed",
                details: error?.message || "Unknown error",
                context: { businessId },
            });
            return `${this.formattedDatePrefix(CODE_PREFIX.INVOICE)}${utils_service_1.default.randomNumber()}`;
        }
    }
    async purchaseAutoCodeGenerate({ businessId }) {
        const prefix = this.formattedDatePrefix(CODE_PREFIX.PURCHASE_ORDER);
        const likePattern = `${prefix}%`;
        try {
            const purchases = await prisma_1.default.$queryRaw `
      select 
          coalesce(max(cast(substring_index(purchaseNumber, '-', -1) as unsigned)), 0) as maxNumber
          from purchases
          where businessId = ${businessId}
            and purchaseNumber like ${likePattern}
      `;
            const maxNumber = Number(purchases?.[0]?.maxNumber || 0);
            const newPurchaseCode = `${prefix}${maxNumber + 1}`;
            return newPurchaseCode;
        }
        catch (error) {
            log_service_1.default.error({
                source: "auto code generate purchase service",
                message: "auto code generate purchase service failed",
                details: `${error?.message || "Unknown error"}`,
                context: { businessId },
            });
            return `${prefix}${utils_service_1.default.randomNumber()}`;
        }
    }
    async employeeAutoCodeGenerate({ businessId }) {
        try {
            const employees = await prisma_1.default.employees.findMany({
                where: { businessId },
                select: { empCode: true },
                orderBy: { id: "desc" },
                take: 100,
            });
            let maxNumber = 0;
            employees.forEach((employee) => {
                const number = this.extractNumber(employee.empCode, CODE_PREFIX.EMPLOYEE);
                if (number > maxNumber)
                    maxNumber = number;
            });
            const newItemCode = `${CODE_PREFIX.EMPLOYEE}${maxNumber + 1}`;
            return newItemCode;
        }
        catch (error) {
            log_service_1.default.error({
                source: "auto code generate employee service",
                message: "auto code generate employee service failed",
                details: `${error?.message || "Unknown error"}`,
                context: { businessId },
            });
            return `${CODE_PREFIX.EMPLOYEE}${utils_service_1.default.randomNumber()}`;
        }
    }
    async departmentAutoCodeGenerate({ businessId }) {
        try {
            const departments = await prisma_1.default.departments.findMany({
                where: { businessId },
                select: { deptCode: true },
                orderBy: { id: "desc" },
                take: 100,
            });
            let maxNumber = 0;
            departments.forEach((department) => {
                const number = this.extractNumber(department.deptCode, CODE_PREFIX.DEPARTMENT);
                if (number > maxNumber)
                    maxNumber = number;
            });
            const newItemCode = `${CODE_PREFIX.DEPARTMENT}${maxNumber + 1}`;
            return newItemCode;
        }
        catch (error) {
            log_service_1.default.error({
                source: "auto code generate department service",
                message: "auto code generate department service failed",
                details: `${error?.message || "Unknown error"}`,
                context: { businessId },
            });
            return `${CODE_PREFIX.DEPARTMENT}${utils_service_1.default.randomNumber()}`;
        }
    }
    async cus_gen({ businessId }) {
        return this.customerAutoCodeGenerate({ businessId });
    }
    async item_gen({ businessId }) {
        return this.itemAutoCodeGenerate({ businessId });
    }
    async inv_gen({ businessId }) {
        return this.invoiceAutoCodeGenerate({ businessId });
    }
    async po_gen({ businessId }) {
        return this.purchaseAutoCodeGenerate({ businessId });
    }
    async emp_gen({ businessId }) {
        return this.employeeAutoCodeGenerate({ businessId });
    }
    async dept_gen({ businessId }) {
        return this.departmentAutoCodeGenerate({ businessId });
    }
}
const autoCodeGenerateService = new AutoCodeGenerateService();
exports.default = {
    cus_gen: autoCodeGenerateService.cus_gen.bind(autoCodeGenerateService),
    item_gen: autoCodeGenerateService.item_gen.bind(autoCodeGenerateService),
    inv_gen: autoCodeGenerateService.inv_gen.bind(autoCodeGenerateService),
    po_gen: autoCodeGenerateService.po_gen.bind(autoCodeGenerateService),
    emp_gen: autoCodeGenerateService.emp_gen.bind(autoCodeGenerateService),
    dept_gen: autoCodeGenerateService.dept_gen.bind(autoCodeGenerateService),
};
//# sourceMappingURL=auto-code-generate.service.js.map