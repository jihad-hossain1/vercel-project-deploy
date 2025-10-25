"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = __importDefault(require("../lib/prisma"));
const prisma_2 = require("../../generated/prisma");
const log_service_1 = __importDefault(require("./log.service"));
class InventoryService {
    async updateProductInventory(props) {
        const { products, businessId } = props;
        if (!products || !products.length) {
            return { success: false, error: "No products provided" };
        }
        if (!businessId) {
            return { success: false, error: "Business ID is required" };
        }
        try {
            const cleanedProducts = products.map((p) => ({
                itemId: Number(p.itemId),
                unitPrice: Number(p.unitPrice) || 0,
                costPrice: Number(p.costPrice) || 0,
            }));
            const validProducts = cleanedProducts.filter((p) => p.itemId > 0);
            if (!validProducts.length) {
                return { success: false, error: "No valid product IDs provided" };
            }
            const itemIds = validProducts.map((item) => item.itemId);
            const unitPriceCases = validProducts.map((product) => prisma_2.Prisma.sql `WHEN ${product.itemId} THEN ${product.unitPrice}`);
            const costPriceCases = validProducts.map((product) => prisma_2.Prisma.sql `WHEN ${product.itemId} THEN ${product.costPrice}`);
            await prisma_1.default.$transaction(async (tx) => {
                await tx.$queryRaw `
          UPDATE items
          SET
            unitPrice = CASE id
              ${prisma_2.Prisma.join(unitPriceCases)}
              ELSE unitPrice
            END,
            costPrice = CASE id
              ${prisma_2.Prisma.join(costPriceCases)}
              ELSE costPrice
            END
          WHERE id IN (${prisma_2.Prisma.join(itemIds.map((id) => prisma_2.Prisma.sql `${id}`))})
            AND businessId = ${businessId}
        `;
            });
            return {
                success: true,
                message: `Successfully updated ${itemIds.length} products`,
            };
        }
        catch (error) {
            await log_service_1.default.error({
                source: "inventory-service",
                message: "Update product inventory failed",
                details: error.message,
                context: { products, businessId, error },
            });
            return { success: false, error: "Update product inventory failed" };
        }
    }
    async updateStockMovement(props) {
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
            await prisma_1.default.$transaction(async (tx) => {
                await tx.$queryRaw `
          INSERT INTO stock_movements
          (businessId, userId, itemId, movementType, qty, movementDate, purchaseId, saleId)
          VALUES
          ${prisma_2.Prisma.join(sanitizedProducts.map((p) => prisma_2.Prisma.sql `(${p.businessId}, ${p.userId}, ${p.itemId}, ${p.movementType}, ${p.qty}, ${prisma_2.Prisma.sql `NOW()`}, ${p.purchaseId}, ${p.saleId})`))}
        `;
            });
            return { success: true };
        }
        catch (error) {
            await log_service_1.default.error({
                source: "inventory-service",
                message: "Update stock movement failed",
                details: error.message,
                context: { products, businessId, userId, error },
            });
            return { success: false, error: "Update stock movement failed" };
        }
    }
}
exports.default = new InventoryService();
//# sourceMappingURL=inventory.service.js.map