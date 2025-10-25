import prisma from "../lib/prisma";

import { employeeSchema } from "../helpers/validate";
import logService from "./log.service";
import codeGenService from "./auto-code-generate.service";
import dashboardService from "./dashboard.service";

class EmployeeService {
  // Employee operations
  async createEmployee(employeeData: any) {
    const safeParse = employeeSchema.safeParse(employeeData);
    if (!safeParse.success) {
      return { success: false, error: safeParse.error.flatten() };
    }
    const {
      businessId,
      email,
      departmentName,
      hireDate,
      password,
      userName,
      departmentId,
      mobile,
      rolePermission,
    } = safeParse.data;

    try {
      const gen_code = await codeGenService.emp_gen({ businessId: businessId });

      await prisma.employees.create({
        data: {
          empCode: gen_code,
          businessId: Number(businessId),
          email,
          departmentName,
          hireDate: new Date(hireDate).toISOString(),
          password,
          userName,
          departmentId: Number(departmentId),
          mobile,
          rolePermission,
        },
      });

      // increment employee count in business stats
      await dashboardService.updateDashboardStats({
        businessId,
        stats: {
          employees: 1,
        },
      });
      return { success: true };
    } catch (error) {
      logService.error({
        source: "employee-service",
        message: "employee create failed",
        details: `${error?.message}`,
        context: { businessId: businessId },
      });
      return {
        success: false,
        error: `Failed to create employee: ${error.message}`,
      };
    }
  }

  async getEmployeeById({ id, businessId }) {
    try {
      const employee = await prisma.employees.findFirst({
        where: {
          id: Number(id),
          businessId: Number(businessId),
        },
      });
      return {
        success: true,
        data: employee,
      };
    } catch (error) {
      logService.error({
        source: "employee-service",
        message: "get employee failed",
        details: error.message,
        context: { businessId },
      });
      return {
        success: false,
        error: `Failed to get customer: ${error.message}`,
      };
    }
  }

  async getEmployeesByBusiness(props: {
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
    )
      return {
        error: "Business Id must be a valid positive integer",
        success: false,
      };

    // For page-based pagination: page 1 should start at offset 0
    const calculatedOffset =
      Number(offset) || (Number(page) - 1) * Number(limit);

    // Build where conditions
    const whereConditions: any = {
      businessId: Number(businessId),
    };

    // Add query filter for codeName if provided
    if (query && query.trim() !== "") {
      whereConditions.OR = {
        empCode: { contains: query.trim(), mode: "insensitive" },
        userName: { contains: query.trim(), mode: "insensitive" },
        email: { contains: query.trim(), mode: "insensitive" },
      };
    }

    try {
      const businessEmployees = await prisma.employees.findMany({
        where: whereConditions,
        take: Number(limit),
        skip: calculatedOffset,
        orderBy: { createdAt: "desc" },
      });

      const totalCount = await prisma.employees.count({
        where: whereConditions,
      });
      const totalPages = Math.ceil(totalCount / Number(limit));

      return {
        success: true,
        data: businessEmployees,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalPages,
          totalCount,
        },
      };
    } catch (error) {
      logService.error({
        source: "employee-service",
        message: "get employee failed",
        details: error.message,
        context: { businessId },
      });
      return { error: error?.message, success: false };
    }
  }

  async updateEmployee(id: number, updateData: any) {
    try {
      await prisma.employees.update({
        where: { id: Number(id) },
        data: { ...updateData, updatedAt: new Date() },
      });
      return {
        success: true,
      };
    } catch (error) {
      logService.error({
        source: "employee-service",
        message: "update employee failed",
        details: error.message,
        context: { id },
      });
      return {
        success: false,
        error: `Failed to update employee: ${error.message}`,
      };
    }
  }
}

export default new EmployeeService();
