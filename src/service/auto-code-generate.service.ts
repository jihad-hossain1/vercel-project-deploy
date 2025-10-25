import prisma from "../lib/prisma";
import utilService from "../utils/utils.service";
import logService from "./log.service";

const CODE_PREFIX = {
  CUSTOMER: "CST",
  ITEM: "PRO",
  INVOICE: "SO",
  PURCHASE_ORDER: "PO",
  EMPLOYEE: "EMP",
  DEPARTMENT: "DEP",
};

class AutoCodeGenerateService {
  formattedDatePrefix(prefix: string) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${prefix}-${year}${month}${day}-`;
  }

  extractNumber(code: string, prefix: string) {
    if (!code) return 0;
    const numberPart = code.replace(prefix, "").replace(/\D/g, "");
    return parseInt(numberPart) || 0;
  }

  async customerAutoCodeGenerate({ businessId }: { businessId: number }) {
    const likeQuery = `${CODE_PREFIX.CUSTOMER}%`;
    try {
      const customers = await prisma.$queryRaw`
        select 
          max(cast(substring_index(cusCode, '-', -1) as unsigned)) as maxNumber
        from customers
        where businessId = ${businessId}
        and cusCode like ${likeQuery}
      ` as { maxNumber: number | null }[];
     
      const maxNumber = Number(customers?.[0]?.maxNumber || 0);
      const newItemCode = `${CODE_PREFIX.CUSTOMER}-${maxNumber + 1}`;
      return newItemCode;
    } catch (error) {
      logService.error({
        source: "auto code generate customer service",
        message: "auto code generate customer service failed",
        details: `${(error as Error)?.message || "Unknown error"}`,
        context: { businessId },
      });
      return `${CODE_PREFIX.CUSTOMER}-${utilService.randomNumber()}`;
    }
  }

  async itemAutoCodeGenerate({ businessId }: { businessId: number }) {
    const likeQuery = `${CODE_PREFIX.ITEM}%`;
    try {
      const items = await prisma.$queryRaw`
        select 
          max(cast(substring_index(proCode, '-', -1) as unsigned)) as maxNumber
        from items
        where businessId = ${businessId}
        and proCode like ${likeQuery}
      ` as { maxNumber: number | null }[];
     
      const maxNumber = Number(items?.[0]?.maxNumber || 0);
      const newItemCode = `${CODE_PREFIX.ITEM}-${maxNumber + 1}`;
      return newItemCode;
    } catch (error) {
      logService.error({
        source: "auto code generate item service",
        message: "auto code generate item service failed",
        details: `${(error as Error)?.message || "Unknown error"}`,
        context: { businessId },
      });
      return `${CODE_PREFIX.ITEM}${utilService.randomNumber()}`;
    }
  }

 async invoiceAutoCodeGenerate({ businessId }: { businessId: number }) {
  try {
    const todayPrefix = this.formattedDatePrefix(CODE_PREFIX.INVOICE);
    // e.g. "INV-20251021-"
    const likePattern = `${todayPrefix}%`;

    const result = await prisma.$queryRaw`
      SELECT 
        COALESCE(MAX(CAST(SUBSTRING_INDEX(invoiceNumber, '-', -1) AS UNSIGNED)), 0) AS maxNumber
      FROM invoice_master
      WHERE businessId = ${businessId}
        AND invoiceNumber LIKE ${likePattern};
      ` as { maxNumber: number | null }[];

    const maxNumber = Number(result?.[0]?.maxNumber || 0);
    const newInvoiceNumber = `${todayPrefix}${maxNumber + 1}`;

    return newInvoiceNumber;
  } catch (error) {
    logService.error({
      source: "auto code generate invoice service",
      message: "auto code generate invoice service failed",
      details: (error as Error)?.message || "Unknown error",
      context: { businessId },
    });

    // fallback (e.g. INV-20251021-573)
    return `${this.formattedDatePrefix(CODE_PREFIX.INVOICE)}${utilService.randomNumber()}`;
  }
}


  async purchaseAutoCodeGenerate({ businessId }: { businessId: number }) {

    const prefix = this.formattedDatePrefix(CODE_PREFIX.PURCHASE_ORDER);
    const likePattern = `${prefix}%`;
    try {

      const purchases = await prisma.$queryRaw`
      select 
          coalesce(max(cast(substring_index(purchaseNumber, '-', -1) as unsigned)), 0) as maxNumber
          from purchases
          where businessId = ${businessId}
            and purchaseNumber like ${likePattern}
      ` as { maxNumber: number | null }[];
      
      const maxNumber = Number(purchases?.[0]?.maxNumber || 0);
     
     
      const newPurchaseCode = `${prefix}${maxNumber + 1}`;
      return newPurchaseCode;
    } catch (error) {
      logService.error({
        source: "auto code generate purchase service",
        message: "auto code generate purchase service failed",
        details: `${(error as Error)?.message || "Unknown error"}`,
        context: { businessId },
      });

      return `${prefix}${utilService.randomNumber()}`;
    }
  }

  async employeeAutoCodeGenerate({ businessId }: { businessId: number }) {
    try {
      const employees = await prisma.employees.findMany({
        where: { businessId },
        select: { empCode: true },
        orderBy: { id: "desc" },
        take: 100,
      });

      let maxNumber = 0;
      employees.forEach((employee: { empCode: string }) => {
        const number = this.extractNumber(
          employee.empCode,
          CODE_PREFIX.EMPLOYEE
        );
        if (number > maxNumber) maxNumber = number;
      });

      const newItemCode = `${CODE_PREFIX.EMPLOYEE}${maxNumber + 1}`;
      return newItemCode;
    } catch (error) {
      logService.error({
        source: "auto code generate employee service",
        message: "auto code generate employee service failed",
        details: `${(error as Error)?.message || "Unknown error"}`,
        context: { businessId },
      });
      return `${CODE_PREFIX.EMPLOYEE}${utilService.randomNumber()}`;
    }
  }

  async departmentAutoCodeGenerate({ businessId }: { businessId: number }) {
    try {
      const departments = await prisma.departments.findMany({
        where: { businessId },
        select: { deptCode: true },
        orderBy: { id: "desc" },
        take: 100,
      });

      let maxNumber = 0;
      departments.forEach((department: { deptCode: string }) => {
        const number = this.extractNumber(
          department.deptCode,
          CODE_PREFIX.DEPARTMENT
        );
        if (number > maxNumber) maxNumber = number;
      });

      const newItemCode = `${CODE_PREFIX.DEPARTMENT}${maxNumber + 1}`;
      return newItemCode;
    } catch (error) {
      logService.error({
        source: "auto code generate department service",
        message: "auto code generate department service failed",
        details: `${(error as Error)?.message || "Unknown error"}`,
        context: { businessId },
      });
      return `${CODE_PREFIX.DEPARTMENT}${utilService.randomNumber()}`;
    }
  }

  /**
   *
   * @param {businessId} businessId: Must be number and required
   * @returns {string}
   */
  async cus_gen({ businessId }: { businessId: number }): Promise<string> {
    return this.customerAutoCodeGenerate({ businessId });
  }

  /**
   *
   * @param {businessId} businessId: Must be number and required
   * @returns {string}
   */
  async item_gen({ businessId }: { businessId: number }): Promise<string> {
    return this.itemAutoCodeGenerate({ businessId });
  }

  async inv_gen({ businessId }: { businessId: number }): Promise<string> {
    return this.invoiceAutoCodeGenerate({ businessId });
  }

  async po_gen({ businessId }: { businessId: number }): Promise<string> {
    return this.purchaseAutoCodeGenerate({ businessId });
  }

  /**
   *
   * @param {businessId} businessId: Must be number and required
   * @returns {string}
   */
  async emp_gen({ businessId }: { businessId: number }): Promise<string> {
    return this.employeeAutoCodeGenerate({ businessId });
  }

  /**
   *
   * @param {businessId} businessId: Must be number and required
   * @returns {string}
   */
  async dept_gen({ businessId }: { businessId: number }): Promise<string> {
    return this.departmentAutoCodeGenerate({ businessId });
  }
}

const autoCodeGenerateService = new AutoCodeGenerateService();

export default {
  cus_gen: autoCodeGenerateService.cus_gen.bind(autoCodeGenerateService),
  item_gen: autoCodeGenerateService.item_gen.bind(autoCodeGenerateService),
  inv_gen: autoCodeGenerateService.inv_gen.bind(autoCodeGenerateService),
  po_gen: autoCodeGenerateService.po_gen.bind(autoCodeGenerateService),
  emp_gen: autoCodeGenerateService.emp_gen.bind(autoCodeGenerateService),
  dept_gen: autoCodeGenerateService.dept_gen.bind(autoCodeGenerateService),
};
