import prisma from "../lib/prisma";
import { itemSchema, SearchSchema } from "../helpers/validate";
import { z } from "zod";
import { items, Prisma } from "../../generated/prisma";

// Service imports
import logService from "./log.service";
import dashboardService from "./dashboard.service";
import codeGenerator from "./auto-code-generate.service";

const ArchiveSchema = z.object({
  businessId: z.number().int("businessId must be an integer"),
  itemId: z.number().int("itemId must be an integer"),
  isActive: z.boolean(),
});

interface ItemAnalyticsProps {
  businessId: number;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

interface ItemSalesHistoryProps {
  businessId: number;
  itemId: number;
  fromDate?: string;
  toDate?: string;
  limit?: number;
}

class ItemService {
  /**
   * @description: Create item
   * @param {*} itemData
   * @return {*}
   */
  async createItem(
    itemData: any
  ): Promise<{ success: boolean; errors?: any; error?: string }> {
    // validate itemData
    const validatedItemData = itemSchema.safeParse(itemData);

    if (!validatedItemData?.success)
      return {
        success: false,
        errors: validatedItemData?.error?.format(),
        error: "validation failed",
      };
    // insert itemData
    try {
      const {
        name,
        category,
        unitPrice,
        stockQuantity,
        minStockLevel,
        businessId,
        costPrice,
        description,
        catId,
        unit,
        taxRate,
        discountRate,
      } = validatedItemData.data;

      const item_gen = await codeGenerator.item_gen({ businessId: businessId });

      await prisma.items.create({
        data: {
          name,
          category,
          proCode: item_gen,
          unitPrice,
          stockQuantity,
          minStockLevel,
          costPrice,
          businessId: Number(businessId),
          description,
          catId: Number(catId),
          unit,
          taxRate,
          createdAt: new Date(),
          discountRate,
          sku: item_gen,
        },
      });

      // increment items count in business stats
      await dashboardService.updateDashboardStats({
        businessId,
        stats: {
          items: 1,
        },
      });

      return { success: true };
    } catch (error) {
      logService.error({
        source: "item-service",
        message: "create item failed",
        details: error.message,
        context: { error },
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * @description: Get items by business id with pagination and query filter
   * @param {*} businessId
   * @param {*} page
   * @param {*} limit
   * @param {*} offset
   * @param {*} query
   * @return {*}
   */
  async getItemsByBusiness(props: {
    businessId: number;
    page?: number;
    limit?: number;
    offset?: number;
    query?: string;
  }): Promise<{
    success: boolean;
    errors?: any;
    error?: string;
    data?: any;
    pagination?: {
      totalPages: number;
    };
  }> {
    const { businessId, page = 1, limit = 10, offset = 0, query = "" } = props;

    if (
      !businessId ||
      isNaN(businessId) ||
      !Number.isInteger(Number(businessId)) ||
      Number(businessId) <= 0
    )
      return {
        error: "Business Id must be a valid positive integer",
        success: false,
      };

    // For page-based pagination: page 1 should start at offset 0
    const calculatedOffset =
      Number(offset) || (Number(page) - 1) * Number(limit);

    const sanitizedQuery = `%${query}%`;
    try {
      const items = (await prisma.$queryRaw`
            select *
            from items 
            where businessId = ${Number(businessId)}
            and (name like ${sanitizedQuery} or proCode like ${sanitizedQuery})
            order by createdAt desc
            limit ${Number(limit)}
            offset ${calculatedOffset}
            `) as items[];

            const itemIds = items.map((item) => item.id);
            const stockCount = (await prisma.$queryRaw`
            select itemId, sum(qty) as totalStock
            from stock_movements
            where itemId in (${Prisma.join(itemIds)})
            group by itemId
            `) as { itemId: number; totalStock: number }[];

      const totalCount = (await prisma.$queryRaw`
            select count(*) as totalCount from items
            where businessId = ${Number(businessId)}
            and (name like ${sanitizedQuery} or proCode like ${sanitizedQuery})
            `) as { totalCount: number }[];

      const totalPages = Math.ceil(
        Number(totalCount[0].totalCount) / Number(limit)
      );

      return {
        success: true,
        data: items.map((item) => ({
          ...item,
          totalStock: stockCount.find((count) => count.itemId === item.id)?.totalStock || 0,
        })),
        pagination: {
          totalPages,
        },
      };
    } catch (error) {
      logService.error({
        source: "item-service",
        message: "get items failed",
        details: error.message,
        context: { businessId },
      });
      return { error: error?.message, success: false };
    }
  }

  /**
   * @description: Get item by id
   * @param {*} itemId
   * @param {*} businessId
   * @return {*}
   */
  async getItemById(props: { itemId: number; businessId: number }): Promise<{
    success: boolean;
    errors?: any;
    error?: string;
    data?: any;
  }> {
    try {
      const { itemId, businessId } = props;
      const item = await prisma.items.findFirst({
        where: { id: Number(itemId), businessId: Number(businessId) },
      });
      return {
        success: true,
        data: item,
      };
    } catch (error) {
      logService.error({
        source: "item-service",
        message: "get item failed",
        details: error.message,
        context: { error },
      });
      return { error: error?.message, success: false };
    }
  }

  /**
   * @description: Update item details
   * @param {*} itemId
   * @param {*} updateData
   * @return {*}
   */
  async updateItem(props: {
    itemId: number;
    businessId: number;
    updateData: any;
  }): Promise<{
    success: boolean;
    errors?: any;
    error?: string;
    message?: string;
  }> {
    try {
      const { itemId, businessId, updateData } = props;
      await prisma.items.update({
        where: { id: Number(itemId), businessId: Number(businessId) },
        data: { ...updateData, updatedAt: new Date() },
      });
      return {
        success: true,
        message: "Item updated successfully",
      };
    } catch (error) {
      logService.error({
        source: "item-service",
        message: "update item failed",
        details: error.message,
        context: { error },
      });
      return {
        success: false,
        message: error.message,
      };
    }
  }

  /**
   * @description: Archive item by setting isActive to false
   * @param {*} businessId
   * @param {*} itemId
   * @param {*} isActive
   * @return {*}
   */
  async archiveItem(props: {
    businessId: number;
    itemId: number;
    isActive: boolean;
  }): Promise<{
    success: boolean;
    errors?: any;
    error?: string;
    message?: string;
  }> {
    const validateSchema = ArchiveSchema.safeParse(props);

    if (!validateSchema.success)
      return {
        success: false,
        error: "Required are missing",
        errors: validateSchema.error.flatten(),
      };

    const { businessId, itemId, isActive } = validateSchema.data;

    try {
      await prisma.items.update({
        where: { id: Number(itemId), businessId: Number(businessId) },
        data: { isActive, updatedAt: new Date() },
      });

      return { success: true };
    } catch (error) {
      logService.error({
        source: "item-service",
        message: "archive item failed",
        details: error.message,
        context: { businessId },
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * @description: Delete item by setting isActive to false
   * @param {*} itemId
   * @return {*}
   */
  async deleteItem(props: { businessId: number; itemId: number }): Promise<{
    success: boolean;
    errors?: any;
    error?: string;
    message?: string;
  }> {
    try {
      const { businessId, itemId } = props;
      // Soft delete by setting isActive to false
      const deletedItem = await prisma.items.update({
        where: { id: Number(itemId), businessId: Number(businessId) },
        data: { isActive: false, updatedAt: new Date() },
      });
      return { success: true, message: "Item deleted successfully" };
    } catch (error) {
      logService.error({
        source: "item-service",
        message: "delete item failed",
        details: error.message,
        context: { error },
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * @description: Search items by name or proCode
   * @param {*} businessId
   * @param {*} searchTerm
   * @param {*} limit
   * @return {*}
   */
  async searchItems(props: {
    businessId: number;
    searchTerm: string;
    limit: number;
  }): Promise<{
    success: boolean;
    errors?: any;
    error?: any;
    data?: any;
  }> {
    const safeParse = SearchSchema.safeParse(props);

    if (!safeParse.success) {
      return { success: false, error: safeParse.error.flatten() };
    }

    const { businessId, searchTerm, limit } = safeParse.data;

    try {
      const data = await prisma.items.findMany({
        where: {
          businessId: Number(businessId),
          isActive: true,
          OR: [
            { name: { contains: searchTerm } },
            { proCode: { contains: searchTerm } },
          ],
        },
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: `Failed to search items: ${error.message}`,
      };
    }
  }

  /**
   * @description: Get item analysis
   * @param {*} businessId
   * @param {*} searchTerm
   * @param {*} page
   * @param {*} limit
   * @param {*} fromDate
   * @param {*} toDate
   * @return {*}
   */
  async itemAnalysis(props: {
    businessId: number;
    searchTerm?: string;
    page?: number;
    limit?: number;
    fromDate?: string;
    toDate?: string;
  }): Promise<{
    success: boolean;
    errors?: any;
    error?: string;
    data?: any;
    message?: string;
  }> {
    const {
      businessId,
      searchTerm = "",
      page = 1,
      limit = 10,
      fromDate,
      toDate,
    } = props;

    const offset = (Number(page || 1) - 1) * limit;
    const sanitizedSearchTerm = `%${searchTerm}%`;

    try {
      const productAnalytics = await prisma.$queryRaw`
              SELECT i.id AS item_id,
                      i.name AS item_name,
                      SUM(CAST(d.quantity AS DECIMAL(10, 2))) AS total_quantity_sold,
                      SUM(CAST(d.lineTotal AS DECIMAL(10, 2))) AS total_sales,
                      ROUND(
                        SUM((CAST(d.unitPrice AS DECIMAL(10, 2)) - CAST(i.costPrice AS DECIMAL(10, 2))) * CAST(d.quantity AS DECIMAL(10, 2)))
                      , 2) AS gross_profit,
                      ROUND(
                        (
                          SUM((CAST(d.unitPrice AS DECIMAL(10, 2)) - CAST(i.costPrice AS DECIMAL(10, 2))) * CAST(d.quantity AS DECIMAL(10, 2))) 
                          / NULLIF(SUM(CAST(d.lineTotal AS DECIMAL(10, 2))), 0)
                        ) * 100, 2
                      ) AS profit_margin
              FROM items i
              LEFT JOIN invoice_detail d ON d.itemId = i.id
              LEFT JOIN invoice_master m ON m.id = d.invoiceMasterId
              WHERE i.businessId = ${businessId}
                AND i.name LIKE ${sanitizedSearchTerm}
              ${
                fromDate && toDate
                  ? Prisma.sql`AND d.createdAt BETWEEN ${new Date(
                      new Date(fromDate).setUTCHours(0, 0, 0, 0)
                    )} AND ${new Date(
                      new Date(toDate).setUTCHours(23, 59, 59, 999)
                    )}`
                  : Prisma.sql``
              }  
              GROUP BY i.id, i.name, i.stockQuantity
              ORDER BY total_sales DESC
              LIMIT ${limit} OFFSET ${offset};
              ` as {
                item_id: number;
                item_name: string;
                total_quantity_sold: number;
                total_sales: number;
                gross_profit: number;
                profit_margin: number;
              }[];

              const itemIds = productAnalytics.map((item) => item.item_id);
              
      const stockCount = (await prisma.$queryRaw`
              select itemId, sum(qty) as totalStock
              from stock_movements
              where itemId in (${Prisma.join(itemIds)})
              group by itemId
              `) as { itemId: number; totalStock: number }[];

      const totalCount = await prisma.$queryRaw`
              SELECT COUNT(DISTINCT i.id) AS total_count
              FROM items i
              LEFT JOIN invoice_detail d ON d.itemId = i.id
              LEFT JOIN invoice_master m ON m.id = d.invoiceMasterId
              WHERE i.businessId = ${businessId}
                AND i.name LIKE ${sanitizedSearchTerm}
                ${
                  fromDate && toDate
                    ? Prisma.sql`AND d.createdAt BETWEEN ${new Date(
                        new Date(fromDate).setUTCHours(0, 0, 0, 0)
                      )} AND ${new Date(
                        new Date(toDate).setUTCHours(23, 59, 59, 999)
                      )}`
                    : Prisma.sql``
                }
                ;
              `;

      const totalItems = Number(totalCount?.[0]?.total_count || 0);
      const totalPages = Math.ceil(totalItems / limit);

      return {
        success: true,
        data: {
          data: productAnalytics.map((item) => ({
            ...item,
            current_stock: stockCount.find((count) => count.itemId == item.item_id)?.totalStock || 0,
          })),
          totalPages,
        },
      };
    } catch (error: any) {
      logService.error({
        source: "item-service",
        message: "item analysis failed",
        details: error.message,
        context: { businessId },
      });
      return {
        success: false,
        message: "item analysis failed",
        errors: error.message,
      };
    }
  }

  /**
   * @description: Get single item analysis
   * @param {*} businessId number
   * @param {*} itemId number
   * @param {*} page number
   * @param {*} limit number
   * @param {*} fromDate string
   * @param {*} toDate string
   * @return {*}
   */
  async itemSalesHistory(props: {
    businessId: number;
    itemId: number;
    page?: number;
    limit?: number;
    fromDate?: string;
    toDate?: string;
    searchTerm: string;
  }): Promise<{
    success: boolean;
    errors?: any;
    error?: string;
    data?: any;
    message?: string;
  }> {
    const {
      businessId,
      itemId,
      page = 1,
      limit = 10,
      fromDate,
      toDate,
      searchTerm = "",
    } = props;

    const offset = (Number(page || 1) - 1) * limit;
    const sanitizedSearchTerm = `%${searchTerm}%`;

    try {
      const histories = await prisma.$queryRaw`
        select d.*, m.invoiceNumber from invoice_detail d
        left join invoice_master m on m.id = d.invoiceMasterId
        WHERE 
          d.businessId = ${Number(businessId)}
          AND d.itemId = ${Number(itemId)}
          AND LOWER(COALESCE(m.invoiceNumber, '')) LIKE CONCAT(${sanitizedSearchTerm})
${
  fromDate && toDate
    ? Prisma.sql`AND d.createdAt BETWEEN ${new Date(
        new Date(fromDate).setUTCHours(0, 0, 0, 0)
      )} AND ${new Date(new Date(toDate).setUTCHours(23, 59, 59, 999))}`
    : Prisma.sql``
}
      ORDER BY d.createdAt DESC
      LIMIT ${limit} OFFSET ${offset}
      `;

      const totalCount = await prisma.$queryRaw`
        SELECT COUNT(*) AS total_count
        FROM invoice_detail
        WHERE 
          businessId = ${Number(businessId)}
          AND itemId = ${Number(itemId)}
${
  fromDate && toDate
    ? Prisma.sql`AND createdAt BETWEEN ${new Date(
        new Date(fromDate).setUTCHours(0, 0, 0, 0)
      )} AND ${new Date(new Date(toDate).setUTCHours(23, 59, 59, 999))}`
    : Prisma.sql``
}
      `;
      const totalItems = Number(totalCount[0].total_count || 0);
      const totalPages = Math.ceil(totalItems / limit);

      return {
        success: true,
        data: {
          data: histories || [],
          totalPages: totalPages || 1,
        },
      };
    } catch (error) {
      logService.error({
        source: "item-service",
        message: "single item analysis failed",
        details: error.message,
        context: { businessId, itemId },
      });
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

export default new ItemService();
