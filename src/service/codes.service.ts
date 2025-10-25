import { codesSchema, ArchiveSchema, SearchSchema } from "../helpers/validate";
import prisma from "../lib/prisma";

import logService from "./log.service";

class CodesService {
  async newCodes(requireData: any) {
    const safeParse = codesSchema.safeParse(requireData);

    if (!safeParse.success)
      return {
        success: false,
        error: "Field are mission",
        errors: safeParse?.error?.flatten(),
      };

    const { businessId, codeName, codeType, codeDesc, longDesc } =
      safeParse.data;

    try {
      // codeName are not duplicate based on businessId check
      const findExistingCode = await prisma.codes.findMany({
        where: { businessId: Number(businessId), codeName },
      });

      if (findExistingCode.length > 0) {
        return {
          success: false,
          error: "Code name already exists for this business",
        };
      }

      // Insert new code
      await prisma.codes.create({
        data: {
          businessId: Number(businessId),
          codeName,
          codeType,
          codeDesc,
          longDesc,
          createdAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      logService.error({
        source: "codes-service",
        message: "Codes create failed",
        details: `${error?.message}`,
        context: { businessId },
      });
      return { success: false, error: error?.message };
    }
  }

  async getCodesByBusiness(props) {
    const {
      businessId,
      page = 1,
      limit = 10,
      offset = 0,
      query = "",
      codeType = "category",
    } = props;

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

    try {
      // Calculate offset if not provided
      // For page-based pagination: page 1 should start at offset 0
      const calculatedOffset =
        Number(offset) || (Number(page) - 1) * Number(limit);

      const where = {
        businessId: Number(businessId),
        codeType,
        codeName:
          query && query.trim() !== ""
            ? { contains: query.trim(), mode: "insensitive" }
            : undefined,
      };

      const [businessCodes, totalCount] = await prisma.$transaction([
        prisma.codes.findMany({
          where,
          take: Number(limit),
          skip: calculatedOffset,
          orderBy: { id: "desc" },
        }),
        prisma.codes.count({ where }),
      ]);

      const totalPages = Math.ceil(totalCount / Number(limit));

      return {
        success: true,
        data: businessCodes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalPages,
          totalCount,
        },
      };
    } catch (error) {
      logService.error({
        source: "codes-service",
        message: "Get codes by business failed",
        details: `${error?.message}`,
        context: { businessId },
      });
      return { success: false, error: error?.message };
    }
  }

  async updateCodes(codeId, requireData) {
    const safeParse = codesSchema.safeParse(requireData);

    if (!safeParse.success)
      return {
        success: false,
        error: "Field are mission",
        errors: safeParse?.error?.flatten(),
      };

    const { businessId, codeName, codeType, codeDesc } = safeParse.data;

    try {
      // Check if the code exists
      const existingCode = await prisma.codes.findMany({
        where: {
          id: Number(codeId),
        },
      });

      if (existingCode.length === 0) {
        return { success: false, error: "Code not found" };
      }

      // Check for duplicate codeName in the same business (excluding current record)
      const findDuplicateCode = await prisma.codes.findMany({
        where: {
          businessId: Number(businessId),
          codeName: codeName,
          id: {
            not: Number(codeId),
          },
        },
      });

      if (findDuplicateCode.length > 0) {
        return {
          success: false,
          error: "Code name already exists for this business",
        };
      }

      // Update the code with Prisma
      const updatedCode = await prisma.codes.update({
        where: {
          id: Number(codeId),
        },
        data: {
          businessId: Number(businessId),
          codeName,
          codeType,
          codeDesc,
          updatedAt: new Date(),
        },
      });

      return { success: true, data: updatedCode };
    } catch (error) {
      logService.error({
        source: "codes-service",
        message: "Codes update failed",
        details: `${error?.message}`,
        context: { codeId, businessId },
      });
      return { success: false, error: error?.message };
    }
  }

  async archiveCode(props) {
    const validateSchema = ArchiveSchema.safeParse(props);

    if (!validateSchema.success)
      return {
        success: false,
        error: "Required are missing",
        errors: validateSchema.error.flatten(),
      };

    const { businessId, id, isActive } = validateSchema.data;

    try {
      await prisma.codes.updateMany({
        where: {
          businessId: Number(businessId),
          id: Number(id),
        },
        data: {
          isActive,
          updatedAt: new Date(),
        },
      });

      return { success: true };
    } catch (error) {
      logService.error({
        source: "code-service",
        message: "archive code failed",
        details: error.message,
        context: { businessId },
      });
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async searchCodes(props: any) {
    const safeParse = SearchSchema.safeParse(props);

    if (!safeParse.success) {
      return { success: false, error: safeParse.error.flatten() };
    }

    const {
      businessId,
      searchTerm,
      limit,
      codeType = "category",
    } = safeParse.data as any;

    try {
      const searchResults = await prisma.codes.findMany({
        where: {
          businessId: Number(businessId),
          isActive: true,
          codeType: codeType,
          OR: [
            {
              codeName: {
                contains: searchTerm,
              },
            },
          ],
        },
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      });
      return {
        success: true,
        data: searchResults,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to search codes: ${error.message}`,
      };
    }
  }

  /**
   *
   * @param {{businessId,codeName,codeType,codeDesc}} requireData
   * @returns
   */
  async create(requireData) {
    return this.newCodes(requireData);
  }

  async get(props) {
    return this.getCodesByBusiness(props);
  }

  async update(codeId, requireData) {
    return await this.updateCodes(codeId, requireData);
  }

  async archive(props) {
    return await this.archiveCode(props);
  }

  async search(props) {
    return await this.searchCodes(props);
  }
}

const codesServices = new CodesService();

export default {
  create: codesServices.create.bind(codesServices),
  get: codesServices.get.bind(codesServices),
  update: codesServices.update.bind(codesServices),
  archive: codesServices.archive.bind(codesServices),
  search: codesServices.search.bind(codesServices),
};
