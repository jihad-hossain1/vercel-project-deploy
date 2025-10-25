import prisma from "../lib/prisma";
import { customerSchema, SearchSchema } from "../helpers/validate";
import logService from "./log.service";
import codeGenService from "./auto-code-generate.service";
import { z } from "zod";
import dashboardService from "./dashboard.service";

const ArchiveSchema = z.object({
    businessId: z.number("businessId is required").int("businessId must be an integer"),

    customerId: z.number("customerId is required").int("customerId must be an integer"),

    isActive: z.boolean("isActive is required"),
});

class CustomerService {
    // Customer operations
    async createCustomer(customerData: any) {
        const safeParse = customerSchema.safeParse(customerData);

        if (!safeParse.success) return { success: false, error: safeParse.error.flatten() };

        const { businessId, email, name, address, city, country, phone, postalCode, state } = safeParse.data;

        try {
            const gen_code = await codeGenService.cus_gen({ businessId: businessId });

            await prisma.customers.create({
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

            // increment customer count in business stats
            await dashboardService.updateDashboardStats({
                businessId,
                stats: {
                    customers: 1,
                },
            });

            return { success: true };
        } catch (error) {
            logService.error({
                source: "customer-service",
                message: "customer create failed",
                details: `${(error as Error)?.message}`,
                context: { businessId: businessId },
            });
            return {
                success: false,
                error: `Failed to create customer: ${(error as Error)?.message}`,
            };
        }
    }

    async getCustomerById(props: { customerId: number; businessId: number }) {
        const { customerId, businessId } = props;

        try {
            const customer = (await prisma.$queryRaw`
      select * from customers
      where id = ${Number(customerId)} and businessId = ${Number(businessId)}
      `) as any;

            return {
                success: true,
                data: customer[0],
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to get customer: ${(error as Error)?.message}`,
            };
        }
    }

    async getCustomersByBusiness(props: any) {
        const { businessId, limit = 10, offset = 0, query = "", page = 1 } = props;

        const whereConditions: any = {
            businessId: parseInt(businessId),
        };

        if (query) {
            whereConditions.OR = [{ name: { contains: query, mode: "insensitive" } }, { cusCode: { contains: query, mode: "insensitive" } }];
        }

        // For page-based pagination: page 1 should start at offset 0
        const calculatedOffset = Number(offset) || (Number(page) - 1) * Number(limit);
        try {
            const businessCustomers = await prisma.customers.findMany({
                where: whereConditions,
                take: parseInt(limit),
                skip: calculatedOffset,
                orderBy: { id: "desc" },
            });

            const totalCount = await prisma.customers.count({
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
        } catch (error) {
            logService.error({
                source: "customer-service",
                message: "customer get failed",
                details: `${(error as Error)?.message}`,
                context: { businessId: businessId },
            });
            return {
                success: false,
                error: `Failed to get customers: ${(error as Error)?.message}`,
            };
        }
    }

    async updateCustomer(id: number, updateData: any) {
        try {
            const updatedCustomer = await prisma.customers.update({
                where: { id: id },
                data: { ...updateData, updatedAt: new Date() },
            });
            return {
                success: true,
                data: updatedCustomer,
            };
        } catch (error) {
            logService.error({
                source: "customer-service",
                message: "customer update failed",
                details: `${(error as Error)?.message}`,
                context: { customerId: id },
            });

            return {
                success: false,
                error: `Failed to update customer: ${(error as Error)?.message}`,
            };
        }
    }

    async archiveCustomer(props: any) {
        const safeParse = ArchiveSchema.safeParse(props);
        if (!safeParse.success) {
            return { success: false, error: safeParse.error.flatten() };
        }
        const { businessId, customerId, isActive } = safeParse.data;
        try {
            await prisma.customers.update({
                where: {
                    id: Number(customerId),
                    businessId: Number(businessId),
                },
                data: { isActive, updatedAt: new Date() },
            });
            return { success: true };
        } catch (error) {
            logService.error({
                source: "customer-service",
                message: "customer archive failed",
                details: `${(error as Error)?.message}`,
                context: { customerId: customerId },
            });

            return {
                success: false,
                error: `Failed to update customer: ${(error as Error)?.message}`,
            };
        }
    }

    async deleteCustomer(id: number) {
        try {
            await prisma.customers.delete({
                where: { id: Number(id) },
            });
            return { success: true };
        } catch (error) {
            throw new Error(`Failed to delete customer: ${(error as Error)?.message}`);
        }
    }

    async searchCustomers(props: any) {
        const safeParse = SearchSchema.safeParse(props);
        if (!safeParse.success) {
            return { success: false, error: safeParse.error.flatten() };
        }

        const { businessId, searchTerm, limit } = safeParse.data;

        try {
            const searchResults = await prisma.customers.findMany({
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
        } catch (error) {
            return {
                success: false,
                error: `Failed to search customers: ${(error as Error)?.message}`,
            };
        }
    }

    async customerSalesAnalytics(props: any) {
        const { businessId, customerId, limit = 10, offset = 0, page = 1 } = props;

        try {
            const analytics = (await prisma.$queryRaw`
            select 
                sum(totalAmount) as totalAmount
            from invoice_master
            where businessId = ${Number(businessId)} and customerId = ${Number(customerId)}
            `) as { totalAmount: number }[];

            // For page-based pagination: page 1 should start at offset 0
            const calculatedOffset = Number(offset) || (Number(page) - 1) * Number(limit);

            const invoices = await prisma.$queryRaw`
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

            const totalCountInvoices = (await prisma.$queryRaw`
            select count(id) as total_count from invoice_master
            where businessId = ${Number(businessId)} and customerId = ${Number(customerId)}
            `) as { total_count: number }[];

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
        } catch (error) {
            return {
                success: false,
                error: `Failed to get customer analytics: ${(error as Error)?.message}`,
            };
        }
    }
}

export default new CustomerService();
