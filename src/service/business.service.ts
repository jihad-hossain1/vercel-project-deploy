import prisma from "../lib/prisma";
import logService from "./log.service";

class BusinessService {
  async getBusinessStats(businessId: number) {
    try {
      // Get business info
      const businessInfo = await prisma.business.findUnique({
        where: { id: Number(businessId) },
      });

      if (!businessInfo) {
        return null;
      }

      // Get customer count
      const customerCount = await prisma.customers.count({
        where: { businessId: Number(businessId) },
      });

      // Get item count
      const itemCount = await prisma.items.count({
        where: { businessId: Number(businessId) },
      });

      // Get invoice count
      const invoiceCount = await prisma.invoice_master.count({
        where: { businessId: Number(businessId) },
      });

      // Get total revenue (sum of paid invoices)
      const revenueResult = await prisma.invoice_master.aggregate({
        where: {
          businessId: Number(businessId),
          status: "paid",
        },
        _sum: {
          totalAmount: true,
        },
      });

      return {
        business: businessInfo,
        stats: {
          customerCount,
          itemCount,
          invoiceCount,
          totalRevenue: Number(revenueResult._sum.totalAmount) || 0,
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to get business stats: ${(error as Error).message}`
      );
    }
  }

  async update(businessId: number, isStockManaged: boolean) {
    try {
      await prisma.business.update({
        where: { id: Number(businessId) },
        data: {
          isStockManaged,
        },
      });
      return { success: true, message: "Business updated successfully" };
    } catch (error) {
      logService.error({
        message: `Failed to update business: ${(error as Error).message}`,
        context: "BusinessService.update",
        path: "b2c_backend/src/service/business.service.ts",
      });

      return { success: false, message: (error as Error).message };
    }
  }
}

export default new BusinessService();
