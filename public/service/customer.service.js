"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const validate_1 = require("../helpers/validate");
const log_service_1 = __importDefault(require("./log.service"));
const auto_code_generate_service_1 = __importDefault(require("./auto-code-generate.service"));
const zod_1 = require("zod");
const dashboard_service_1 = __importDefault(require("./dashboard.service"));
const ArchiveSchema = zod_1.z.object({
    businessId: zod_1.z.number("businessId is required").int("businessId must be an integer"),
    customerId: zod_1.z.number("customerId is required").int("customerId must be an integer"),
    isActive: zod_1.z.boolean("isActive is required"),
});
class CustomerService {
    async createCustomer(customerData) {
        const safeParse = validate_1.customerSchema.safeParse(customerData);
        if (!safeParse.success)
            return { success: false, error: safeParse.error.flatten() };
        const { businessId, email, name, address, city, country, phone, postalCode, state } = safeParse.data;
        try {
            const gen_code = await auto_code_generate_service_1.default.cus_gen({ businessId: businessId });
            await prisma_1.default.customers.create({
                data: {
                    businessId: Number(businessId),
                    email,
                    name,
                    city,
                    address,
                    phone,
                    postalCode,
                    state,
                    country,
                    cusCode: gen_code,
                    createdAt: new Date(),
                },
            });
            await dashboard_service_1.default.updateDashboardStats({
                businessId,
                stats: {
                    customers: 1,
                },
            });
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "customer-service",
                message: "customer create failed",
                details: `${error?.message}`,
                context: { businessId: businessId },
            });
            return {
                success: false,
                error: `Failed to create customer: ${error?.message}`,
            };
        }
    }
    async getCustomerById(props) {
        const { customerId, businessId } = props;
        try {
            const customer = (await prisma_1.default.$queryRaw `
      select * from customers
      where id = ${Number(customerId)} and businessId = ${Number(businessId)}
      `);
            return {
                success: true,
                data: customer[0],
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get customer: ${error?.message}`,
            };
        }
    }
    async getCustomersByBusiness(props) {
        const { businessId, limit = 10, offset = 0, query = "", page = 1 } = props;
        const whereConditions = {
            businessId: parseInt(businessId),
        };
        if (query) {
            whereConditions.OR = [{ name: { contains: query, mode: "insensitive" } }, { cusCode: { contains: query, mode: "insensitive" } }];
        }
        const calculatedOffset = Number(offset) || (Number(page) - 1) * Number(limit);
        try {
            const businessCustomers = await prisma_1.default.customers.findMany({
                where: whereConditions,
                take: parseInt(limit),
                skip: calculatedOffset,
                orderBy: { id: "desc" },
            });
            const totalCount = await prisma_1.default.customers.count({
                where: whereConditions,
            });
            const totalPages = Math.ceil(totalCount / limit);
            return {
                data: businessCustomers,
                pagination: {
                    totalPages,
                    totalCount: totalCount,
                },
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "customer-service",
                message: "customer get failed",
                details: `${error?.message}`,
                context: { businessId: businessId },
            });
            return {
                success: false,
                error: `Failed to get customers: ${error?.message}`,
            };
        }
    }
    async updateCustomer(id, updateData) {
        try {
            const updatedCustomer = await prisma_1.default.customers.update({
                where: { id: id },
                data: { ...updateData, updatedAt: new Date() },
            });
            return {
                success: true,
                data: updatedCustomer,
            };
        }
        catch (error) {
            log_service_1.default.error({
                source: "customer-service",
                message: "customer update failed",
                details: `${error?.message}`,
                context: { customerId: id },
            });
            return {
                success: false,
                error: `Failed to update customer: ${error?.message}`,
            };
        }
    }
    async archiveCustomer(props) {
        const safeParse = ArchiveSchema.safeParse(props);
        if (!safeParse.success) {
            return { success: false, error: safeParse.error.flatten() };
        }
        const { businessId, customerId, isActive } = safeParse.data;
        try {
            await prisma_1.default.customers.update({
                where: {
                    id: Number(customerId),
                    businessId: Number(businessId),
                },
                data: { isActive, updatedAt: new Date() },
            });
            return { success: true };
        }
        catch (error) {
            log_service_1.default.error({
                source: "customer-service",
                message: "customer archive failed",
                details: `${error?.message}`,
                context: { customerId: customerId },
            });
            return {
                success: false,
                error: `Failed to update customer: ${error?.message}`,
            };
        }
    }
    async deleteCustomer(id) {
        try {
            await prisma_1.default.customers.delete({
                where: { id: Number(id) },
            });
            return { success: true };
        }
        catch (error) {
            throw new Error(`Failed to delete customer: ${error?.message}`);
        }
    }
    async searchCustomers(props) {
        const safeParse = validate_1.SearchSchema.safeParse(props);
        if (!safeParse.success) {
            return { success: false, error: safeParse.error.flatten() };
        }
        const { businessId, searchTerm, limit } = safeParse.data;
        try {
            const searchResults = await prisma_1.default.customers.findMany({
                where: {
                    businessId: Number(businessId),
                    isActive: true,
                    OR: [{ name: { contains: searchTerm } }, { email: { contains: searchTerm } }, { phone: { contains: searchTerm } }],
                },
                take: Number(limit),
                orderBy: { createdAt: "desc" },
            });
            return {
                success: true,
                data: searchResults,
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to search customers: ${error?.message}`,
            };
        }
    }
    async customerSalesAnalytics(props) {
        const { businessId, customerId, limit = 10, offset = 0, page = 1 } = props;
        try {
            const analytics = (await prisma_1.default.$queryRaw `
            select 
                sum(totalAmount) as totalAmount
            from invoice_master
            where businessId = ${Number(businessId)} and customerId = ${Number(customerId)}
            `);
            const calculatedOffset = Number(offset) || (Number(page) - 1) * Number(limit);
            const invoices = await prisma_1.default.$queryRaw `
            select status,
            createdAt,
            invoiceNumber,
            invoiceDate,
            totalAmount,
            id
             from invoice_master
            where businessId = ${Number(businessId)} and customerId = ${Number(customerId)}
            order by createdAt desc
            limit ${Number(limit)} offset ${calculatedOffset}
            `;
            const totalCountInvoices = (await prisma_1.default.$queryRaw `
            select count(id) as total_count from invoice_master
            where businessId = ${Number(businessId)} and customerId = ${Number(customerId)}
            `);
            const customer = await this.getCustomerById({
                businessId: Number(businessId),
                customerId: Number(customerId),
            });
            return {
                success: true,
                data: {
                    customer: customer?.data,
                    totalSales: Number(analytics[0].totalAmount) || 0,
                    invoices: {
                        data: invoices,
                        totalPages: Math.ceil(Number(totalCountInvoices[0]?.total_count) / Number(limit)),
                    },
                },
            };
        }
        catch (error) {
            return {
                success: false,
                error: `Failed to get customer analytics: ${error?.message}`,
            };
        }
    }
}
exports.default = new CustomerService();
//# sourceMappingURL=customer.service.js.map