import { departmentSchema } from "../helpers/validate";
import prisma from "../lib/prisma";

import logService from "./log.service";
import autoCodeGenerateService from "./auto-code-generate.service";

class DepartmentService {
  async create(requireData: any) {
    const safeParse = departmentSchema.safeParse(requireData);

    if (!safeParse.success)
      return {
        success: false,
        error: "Fields are missing",
        errors: safeParse?.error?.flatten(),
      };

    const { name, businessId } = safeParse.data;

    try {
      // check department name
      const findDepartment = await prisma.departments.findMany({
        where: {
          businessId: Number(businessId),
          name: {
            contains: name,
          },
        },
      });

      if (findDepartment.length > 0) {
        return {
          success: false,
          error: "Department name already exists for this business",
        };
      }

      const gen_dept_code = await autoCodeGenerateService.dept_gen({
        businessId,
      });

      // Insert new department
      const newDepartment = await prisma.departments.create({
        data: {
          name,
          deptCode: gen_dept_code,
          businessId: Number(businessId),
        },
      });

      return { success: true, data: newDepartment };
    } catch (error) {
      logService.error({
        source: "department-service",
        message: "Department create failed",
        details: `${error?.message}`,
        context: { businessId },
      });
      return { success: false, error: error?.message };
    }
  }

  async update(id: number, updateData: any) {
    const safeParse = departmentSchema.partial().safeParse(updateData);

    if (!safeParse.success)
      return {
        success: false,
        error: "Invalid data",
        errors: safeParse?.error?.flatten(),
      };

    try {
      // Check if department exists
      const existingDept = await prisma.departments.findMany({
        where: {
          id: Number(id),
        },
      });

      if (existingDept.length === 0) {
        return { success: false, error: "Department not found" };
      }

      // If updating deptCode, check if it's unique for this business
      if (
        updateData.deptCode &&
        updateData.deptCode !== existingDept[0].deptCode
      ) {
        const findExistingCode = await prisma.departments.findMany({
          where: {
            businessId: Number(existingDept[0].businessId),
            deptCode: updateData.deptCode,
            id: {
              not: Number(id),
            },
          },
        });

        if (findExistingCode.length > 0) {
          return {
            success: false,
            error: "Department code already exists for this business",
          };
        }
      }

      // Update department
      const updatedDept = await prisma.departments.update({
        where: {
          id: Number(id),
        },
        data: safeParse.data,
      });

      return { success: true, data: updatedDept };
    } catch (error) {
      logService.error({
        source: "department-service",
        message: "Department update failed",
        details: `${error?.message}`,
        context: { id },
      });
      return { success: false, error: error?.message };
    }
  }

  async get(props: {
    businessId: number;
    page?: number;
    limit?: number;
    offset?: number;
    query?: string;
  }) {
    const { businessId, page = 1, limit = 10, offset = 0, query = "" } = props;

    if (
      !businessId ||
      isNaN(businessId) ||
      !Number.isInteger(Number(businessId)) ||
      Number(businessId) <= 0
    ) {
      return {
        error: "Business ID must be a valid positive integer",
        success: false,
      };
    }

    try {
      // Calculate offset if not provided
      const calculatedOffset =
        Number(offset) || (Number(page) - 1) * Number(limit);

      // Build where conditions for Prisma
      const whereConditions: {
        businessId: number;
        name?: {
          contains: string;
        };
      } = {
        businessId: Number(businessId),
      };

      // Add query filter for name if provided
      if (query && query.trim() !== "") {
        whereConditions.name = {
          contains: query.trim(),
        };
      }

      // Get departments for the business with pagination and filters
      const businessDepts = await prisma.departments.findMany({
        where: whereConditions,
        skip: calculatedOffset,
        take: Number(limit),
        orderBy: {
          createdAt: "desc",
        },
      });

      // Get total count for pagination
      const totalCount = await prisma.departments.count({
        where: whereConditions,
      });

      const totalPages = Math.ceil(totalCount / Number(limit));

      return {
        success: true,
        data: businessDepts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalPages,
          totalCount,
        },
      };
    } catch (error) {
      logService.error({
        source: "department-service",
        message: "Get departments failed",
        details: `${error?.message}`,
        context: { businessId },
      });
      return { success: false, error: error?.message };
    }
  }

  async getById(id: number) {
    try {
      const department = await prisma.departments.findMany({
        where: { id: Number(id) },
      });

      if (department.length === 0) {
        return { success: false, error: "Department not found" };
      }

      return { success: true, data: department[0] };
    } catch (error) {
      logService.error({
        source: "department-service",
        message: "Get department by ID failed",
        details: `${error?.message}`,
        context: { id },
      });
      return { success: false, error: error?.message };
    }
  }

  async delete(id) {
    try {
      // Check if department exists
      const existingDept = await prisma.departments.findMany({
        where: { id: Number(id) },
      });

      if (existingDept.length === 0) {
        return { success: false, error: "Department not found" };
      }

      // Delete department
      await prisma.departments.delete({ where: { id: Number(id) } });

      return { success: true, message: "Department deleted successfully" };
    } catch (error) {
      logService.error({
        source: "department-service",
        message: "Department delete failed",
        details: `${error?.message}`,
        context: { id },
      });
      return { success: false, error: error?.message };
    }
  }
}

export default new DepartmentService();
