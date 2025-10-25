import prisma from "../lib/prisma";

import logService from "./log.service";

class DashboardService {
  async getDashboardStats(businessId: number) {
    try {
      const stats = await prisma.business_stats.findUnique({
        where: { businessId: Number(businessId) },
      });
      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get dashboard stats: ${(error as Error)?.message}`,
      };
    }
  }

  async updateDashboardStats(props) {
    const { businessId, stats } = props;
    const {
      customers = 0,
      items = 0,
      employees = 0,
      invoices = 0,
      suppliers = 0,
      purchases = 0,
    } = stats;

    try {
      const previousStats = await prisma.business_stats.findUnique({
        where: { businessId: parseInt(businessId) },
      });

      if (!previousStats) {
        // Create initial stats if they don't exist
        await prisma.business_stats.create({
          data: {
            businessId: parseInt(businessId),
            customers,
            items,
            employees,
            invoices,
            suppliers,
            purchases,
          },
        });
        return { success: true };
      }

      // Update stats by incrementing existing values
      const updateData = {} as {
        customers?: number;
        items?: number;
        employees?: number;
        invoices?: number;
        suppliers?: number;
        purchases?: number;
      };
      if (customers > 0)
        updateData.customers = previousStats.customers + customers;
      if (items > 0) updateData.items = previousStats.items + items;
      if (employees > 0)
        updateData.employees = previousStats.employees + employees;
      if (invoices > 0) updateData.invoices = previousStats.invoices + invoices;
      if (suppliers > 0)
        updateData.suppliers = previousStats.suppliers + suppliers;
      if (purchases > 0)
        updateData.purchases = previousStats.purchases + purchases;

      if (Object.keys(updateData).length > 0) {
        await prisma.business_stats.update({
          where: { businessId: parseInt(businessId) },
          data: updateData,
        });
      }

      return { success: true };
    } catch (error) {
      logService.error({
        source: "dashboard-service",
        message: "update dashboard stats failed",
        details: `${error?.message}`,
        context: { businessId },
      });
      return {
        success: false,
        error: `Failed to update dashboard stats: ${error.message}`,
      };
    }
  }
}

export default new DashboardService();
