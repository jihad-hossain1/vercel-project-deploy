import prisma from "../lib/prisma";
import {
  purchaseClientSchema,
  ArchiveSchema,
  SearchSchema,
  TPurchaseClientSchema,
} from "../helpers/validate";
import logService from "./log.service";
import dashboardService from "./dashboard.service";
import { z } from "zod";

interface PurchaseClientOptions {
  page?: number;
  limit?: number;
  offset?: number;
  query?: string;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

const UpdatePurchaseClient = z.object({
  id: z.number().int(),
  businessId: z.number().int(),
  updateData: purchaseClientSchema.omit({
    id: true,
    businessId: true,
  }),
});

class PurchaseClientService {
  async createPurchaseClient(clientData: {
    email: string;
    businessId: number;
  }) {
    const { email, businessId } = clientData;

    const safeParse = purchaseClientSchema.safeParse(clientData);
    if (!safeParse.success) {
      return {
        success: false,
        error: safeParse.error.message,
      };
    }

    try {
      const parseData = safeParse.data;

      // Check if email already exists for this business
      const existingClient = await prisma.purchase_client.findFirst({
        where: {
          email,
          businessId: Number(businessId),
        },
      });

      if (existingClient) {
        return {
          success: false,
          error:
            "Purchase client with this email already exists for this business",
          client_exist: true,
        };
      }

      const clientDataToCreate = {
        ...parseData,
        businessId: Number(businessId),
      };

      await prisma.purchase_client.create({ data: clientDataToCreate });

      // increment supplier count in business stats
      await dashboardService.updateDashboardStats({
        businessId,
        stats: {
          suppliers: 1,
        },
      });
      return {
        success: true,
      };
    } catch (error) {
      logService.error({
        source: "purchase client service",
        message: "purchase client create failed",
        details: error instanceof Error ? error.message : "Unknown error",
        context: { email, businessId },
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async getPurchaseClientsByBusiness(
    businessId: number,
    options: PurchaseClientOptions = {}
  ) {
    const { page = 1, limit = 10, offset = 0, query = "" } = options;

    if (
      !businessId ||
      isNaN(businessId) ||
      !Number.isInteger(Number(businessId)) ||
      Number(businessId) <= 0
    ) {
      return {
        error: "Business Id must be a valid positive integer",
        success: false,
      };
    }

    const calculatedOffset =
      Number(offset) || (Number(page) - 1) * Number(limit);

    try {
      const where = {
        businessId: Number(businessId),
        name:
          query && query.trim() !== ""
            ? { contains: query.trim(), mode: "insensitive" as const }
            : undefined,
      };

      const [clients, totalCount] = await prisma.$transaction([
        prisma.purchase_client.findMany({
          where,
          take: Number(limit),
          skip: calculatedOffset,
          orderBy: { id: "desc" as const },
        }),
        prisma.purchase_client.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / Number(limit));

      return {
        success: true,
        data: clients,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalPages,
          totalCount,
        },
      };
    } catch (error) {
      logService.error({
        source: "purchase-client-service",
        message: "get purchase client failed",
        details: error instanceof Error ? error.message : "Unknown error",
        context: { businessId },
      });
      return {
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  }

  async getBusinessPurchaseClient(props: { id: number; businessId: number }) {
    const { id, businessId } = props;
    try {
      const client = await prisma.purchase_client.findFirst({
        where: { id: Number(id), businessId: Number(businessId) },
      });

      if (!client) {
        return {
          success: false,
          error: "Purchase client not found",
        };
      }
      return {
        success: true,
        data: client,
      };
    } catch (error) {
      logService.error({
        source: "purchase client service",
        message: "purchase client get by id failed",
        details: error instanceof Error ? error.message : "Unknown error",
        context: { id, businessId },
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async updatePurchaseClient(props: {
    id: number;
    businessId: number;
    updateData: TPurchaseClientSchema;
  }) {
    const validateSchema = UpdatePurchaseClient.safeParse(props);

    if (!validateSchema.success)
      return {
        success: false,
        error: "Required are missing",
        errors: validateSchema.error.flatten(),
      };

    const { id, businessId, updateData } = validateSchema.data;

    try {
      await prisma.purchase_client.updateMany({
        where: { id: Number(id), businessId: Number(businessId) },
        data: { ...updateData, updatedAt: new Date() },
      });

      return { success: true };
    } catch (error) {
      logService.error({
        source: "purchase-client-service",
        message: "update purchase client failed",
        details: error instanceof Error ? error.message : "Unknown error",
        context: { id, businessId },
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async archivePurchaseClient(props: {
    id: number;
    businessId: number;
    isActive: boolean;
  }) {
    const validateSchema = ArchiveSchema.safeParse(props);

    if (!validateSchema.success)
      return {
        success: false,
        error: "Required are missing",
        errors: validateSchema.error.flatten(),
      };

    const { businessId, id, isActive } = validateSchema.data;

    try {
      await prisma.purchase_client.updateMany({
        where: { id: Number(id), businessId: Number(businessId) },
        data: { isActive, updatedAt: new Date() },
      });

      return { success: true };
    } catch (error) {
      logService.error({
        source: "purchase-client-service",
        message: "archive purchase client failed",
        details: error instanceof Error ? error.message : "Unknown error",
        context: { businessId, id },
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  async searchClients(props: {
    businessId: number;
    searchTerm: string;
    limit: number;
  }) {
    const safeParse = SearchSchema.safeParse(props);

    if (!safeParse.success) {
      return { success: false, error: safeParse.error.flatten() };
    }

    const { businessId, searchTerm, limit } = safeParse.data;

    try {
      const data = await prisma.purchase_client.findMany({
        where: {
          businessId: Number(businessId),
          isActive: true,
          OR: [
            { name: { contains: searchTerm } },
            { email: { contains: searchTerm } },
            { phone: { contains: searchTerm } },
          ],
        },
        take: Number(limit),
        orderBy: { createdAt: "desc" },
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

export default new PurchaseClientService();
