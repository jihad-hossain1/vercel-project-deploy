import prisma from "../lib/prisma";
import { Prisma } from "../../generated/prisma";

import logService from "./log.service";

class InventoryService {
  // update product inventory
  async updateProductInventory(props: {
    products: {
      itemId: number;
      qty: number;
      unitPrice: number;
      costPrice: number;
    }[];
    businessId: number;
  }) {
    const { products, businessId } = props;

    // Validate inputs
    if (!products || !products.length) {
      return { success: false, error: "No products provided" };
    }

    if (!businessId) {
      return { success: false, error: "Business ID is required" };
    }

    try {
      // Clean and validate product data
      const cleanedProducts = products.map((p) => ({
        itemId: Number(p.itemId),
        unitPrice: Number(p.unitPrice) || 0,
        costPrice: Number(p.costPrice) || 0,
      }));

      // Filter out invalid products
      const validProducts = cleanedProducts.filter((p) => p.itemId > 0);

      if (!validProducts.length) {
        return { success: false, error: "No valid product IDs provided" };
      }

      // Extract item IDs for the WHERE clause
      const itemIds = validProducts.map((item) => item.itemId);

      // Build dynamic CASE statements for each product
      const unitPriceCases = validProducts.map(
        (product) =>
          Prisma.sql`WHEN ${product.itemId} THEN ${product.unitPrice}`
      );

      const costPriceCases = validProducts.map(
        (product) =>
          Prisma.sql`WHEN ${product.itemId} THEN ${product.costPrice}`
      );

      // Execute optimized query with proper transaction handling
      await prisma.$transaction(async (tx) => {
        // Execute the bulk update
        await tx.$queryRaw`
          UPDATE items
          SET
            unitPrice = CASE id
              ${Prisma.join(unitPriceCases)}
              ELSE unitPrice
            END,
            costPrice = CASE id
              ${Prisma.join(costPriceCases)}
              ELSE costPrice
            END
          WHERE id IN (${Prisma.join(itemIds.map((id) => Prisma.sql`${id}`))})
            AND businessId = ${businessId}
        `;
      });

      return {
        success: true,
        message: `Successfully updated ${itemIds.length} products`,
      };
    } catch (error) {
      await logService.error({
        source: "inventory-service",
        message: "Update product inventory failed",
        details: error.message,
        context: { products, businessId, error },
      });

      return { success: false, error: "Update product inventory failed" };
    }
  }

  async updateStockMovement(props: {
    products: {
      itemId: number;
      quantity: number;
      movementType: "IN" | "OUT";
    }[];
    businessId: number;
    userId: number;
    purchaseId?: number;
    saleId?: number;
  }) {
    const { products, businessId, userId, purchaseId, saleId } = props;

    const sanitizedProducts = products.map((p) => ({
      qty: Number(p.quantity),
      movementType: p.movementType || "IN",
      itemId: Number(p.itemId),
      userId: Number(userId),
      businessId: Number(businessId),
      purchaseId: purchaseId ? Number(purchaseId) : null,
      saleId: saleId ? Number(saleId) : null,
    }));

    try {
      await prisma.$transaction(async (tx) => {
        // Execute the bulk update
        await tx.$queryRaw`
          INSERT INTO stock_movements
          (businessId, userId, itemId, movementType, qty, movementDate, purchaseId, saleId)
          VALUES
          ${Prisma.join(
            sanitizedProducts.map(
              (p) =>
                Prisma.sql`(${p.businessId}, ${p.userId}, ${p.itemId}, ${
                  p.movementType
                }, ${p.qty}, ${Prisma.sql`NOW()`}, ${p.purchaseId}, ${
                  p.saleId
                })`
            )
          )}
        `;
      });

      return { success: true };
    } catch (error) {
      await logService.error({
        source: "inventory-service",
        message: "Update stock movement failed",
        details: error.message,
        context: { products, businessId, userId, error },
      });
      return { success: false, error: "Update stock movement failed" };
    }
  }
}

export default new InventoryService();
