import { z } from "zod";

const userSchema = z.object({
  email: z.string().min(5).max(255).email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  mobile: z
    .string()
    .min(10, "Mobile must be at least 10 characters")
    .min(7, "Mobile too short"),

  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
});
const updateUserSchema = z.object({
  mobile: z
    .string()
    .regex(/^[0-9]+$/, { message: "Contact number must be numeric" }),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
});

const userProfileSchema = z.object({
  id: z.number().optional(),
  address: z.string().optional().nullable(),
  avatar: z.string().optional().nullable(),
  organization: z.string().optional().nullable(),
  contactNumber: z.string().optional().nullable(),
  contactEmail: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  businessId: z.number().int(),
  userId: z.number().int(),
  about: z
    .string()
    .max(500, {
      message: "About must be at most 500 characters",
    })
    .optional(),
});

const loginSchema = z.object({
  email: z.string().min(5).max(255).email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const customerSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(1, { message: "name is required" })
    .max(255, { message: "max value 250 character" }),
  email: z.string().email().max(255, { message: "max value 250 character" }),
  phone: z.string().max(20).optional().nullable(),
  cusCode: z.string().optional().nullable(),
  address: z
    .string()
    .max(500, { message: "max value 500 character" })
    .optional()
    .nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  businessId: z.number().int(),
});

const itemSchema = z.object({
  name: z
    .string()
    .min(1, { message: "name is required" })
    .max(255, { message: "max value 250 character" }),
  description: z.string().max(1000, { message: "max value 1000 character." }),
  category: z
    .string()
    .min(1, { message: "name is required" })
    .max(100, { message: "max value 100 character" }),
  proCode: z
    .string()
    .max(20, { message: "max value 20 character" })
    .optional()
    .nullable(),
  sku: z
    .string()
    .max(100, { message: "SKU must be at most 100 characters." })
    .optional()
    .nullable(),
  unitPrice: z.number().int({ message: "Unit price must be an integer" }),
  costPrice: z.number().int({ message: "Cost price must be an integer" }),
  unit: z
    .string()
    .max(20, { message: "Unit must be at most 20 characters." })
    .default("pcs"),
  taxRate: z
    .number()
    .int({ message: "Tax rate must be an integer" })
    .default(0),
  discountRate: z
    .number()
    .int({ message: "Discount rate must be an integer" })
    .default(0),
  image: z
    .string()
    .max(256, { message: "Image must be at most 256 characters." })
    .default(""),
  catId: z.number().int(),
  stockQuantity: z.number().int().default(0),
  minStockLevel: z.number().int().default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  businessId: z.number().int(),
});

const codesSchema = z.object({
  id: z.number().optional(),
  businessId: z.number(),
  codeType: z
    .string()
    .min(1, { message: "Code type cannot be empty" })
    .max(50, { message: "Code type must be at most 50 characters" }),
  codeName: z
    .string()
    .trim()
    .min(1, { message: "Code name cannot be empty" })
    .max(50, { message: "Code name must be at most 50 characters" }),
  codeDesc: z
    .string()
    .trim()
    .max(150, { message: "Code description must be at most 150 characters" })
    .optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  longDesc: z.json().optional(),
});

const invoiceMasterSchema = z.object({
  id: z.number().optional(),
  invoiceNumber: z.string().optional().nullable(),
  customerId: z.number().optional().nullable(),
  customerPhone: z
    .string()
    .min(1, { message: "Customer Phone number required" }),
  businessId: z.number().int({ message: "Business ID must be an integer" }),
  customerName: z.string().max(100).optional(),
  customerEmail: z.string().max(100).optional(),
  customerAddress: z.string().max(255).optional(),
  invoiceDate: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  subtotal: z.number().int({ message: "Subtotal must be an integer" }),
  tax: z.number().int({ message: "Tax must be an integer" }),
  discount: z.number().int({ message: "Discount must be an integer" }),
  deliveryCharge: z
    .number()
    .int({ message: "Delivery charge must be an integer" }),
  totalAmount: z.number().int({ message: "Total amount must be an integer" }),
  status: z
    .enum(["paid", "credit", "unpaid", "archive"], {
      message: "Status must be one of: paid, credit, unpaid, archive",
    })
    .default("unpaid"),
  notes: z.string().optional().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  createdBy: z.number().int({ message: "Created by must be an integer" }),
  paymentInfo: z.object().optional(),
});

const invoiceCustomerUpdateSchema = z.object({
  customerId: z.number().optional().nullable(),
  customerPhone: z
    .string()
    .min(1, { message: "Customer Phone number required" })
    .max(20, { message: "max value 20 character" }),
  customerName: z
    .string()
    .max(100, { message: "max value 100 character" })
    .optional(),
  customerEmail: z
    .string()
    .max(100, { message: "max value 100 character" })
    .optional(),
  customerAddress: z
    .string()
    .max(255, { message: "max value 255 character" })
    .optional(),
});

const invoiceDetailsSchema = z.object({
  id: z.number().optional(),
  invoiceMasterId: z.number().optional().nullable(),
  itemId: z.number().int(),
  itemName: z
    .string()
    .min(1, { message: "Item name is required" })
    .max(255, { message: "Item name must be at most 255 characters" }),
  description: z.string().optional().nullable(),
  quantity: z.number().int({ message: "Quantity must be an integer" }),
  unitPrice: z.number().int({ message: "Unit price must be an integer" }),
  tax: z.number().default(0),
  discount: z
    .number()
    .int({ message: "Discount must be an integer" })
    .default(0),
  lineTotal: z
    .number()
    .int({ message: "Line total must be an integer" })
    .default(0),
  businessId: z.number().int({ message: "Business ID must be an integer" }),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const InvoiceItemsSchema = z.array(invoiceDetailsSchema).min(1, {
  message: "At least one invoice item is required",
});

const purchaseClientSchema = z.object({
  id: z.number().optional(),
  name: z
    .string()
    .min(1, { message: "name is required" })
    .max(255, { message: "max value 250 character" }),
  email: z.string().email().max(255, { message: "max value 250 character" }),
  phone: z.string().max(20).optional().nullable(),
  address: z
    .string()
    .max(500, { message: "max value 500 character" })
    .optional()
    .nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  contactPerson: z.string().max(255).optional().nullable(),
  taxId: z.string().max(50).optional().nullable(),
  paymentTerms: z.string().max(100).optional().nullable(),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  businessId: z.number().int(),
});

const PurchaseSchema = z.object({
  id: z.number().optional(), // serial primary key
  purchaseNumber: z.string().optional().nullable(),
  supplierId: z.number(),
  supplierName: z.string(),
  supplierEmail: z.string(),
  supplierAddress: z.string().max(255).optional().nullable(),
  supplierPhone: z.string().max(20).optional().nullable(),
  businessId: z.number(),
  purchaseDate: z.string(),
  expectedDeliveryDate: z.string().optional(),
  actualDeliveryDate: z.string().optional(),
  subtotal: z.number(),
  taxAmount: z.number().optional().default(0),
  discountAmount: z.number().optional().default(0),
  shippingCost: z.number().optional().default(0),
  totalAmount: z.number(),
  status: z
    .enum(["pending", "ordered", "received", "cancelled", "credit", "paid"])
    .optional()
    .default("pending"),
  paymentStatus: z
    .enum(["unpaid", "partial", "paid"])
    .optional()
    .default("unpaid"),
  notes: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  createdBy: z.number(),
});

const PurchaseItemSchema = z.object({
  id: z.number().optional().nullable(),
  purchaseId: z.number().optional().nullable(),
  itemId: z.number(),
  itemName: z.string(),
  quantity: z
    .number({ message: "Quantity must be a number" })
    .int({ message: "Quantity must be an integer" }),
  lineTotal: z
    .number({ message: "Line total must be a number" })
    .int({ message: "Line total must be an integer" }),
  businessId: z.number(),
  unitPrice: z
    .number({ message: "Unit price must be a number" })
    .int({ message: "Unit price must be an integer" })
    .optional()
    .nullable(),
  unitCost: z
    .number({ message: "Unit cost must be a number" })
    .int({ message: "Unit cost must be an integer" })
    .optional()
    .nullable(),
  receivedQuantity: z
    .number({ message: "Received quantity must be a number" })
    .optional()
    .nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

const departmentSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, { message: "Department name is required" }).max(100),
  deptCode: z.string().optional(),
  businessId: z.number().int(),
  createdAt: z.string().or(z.date()).optional(),
});

const employeeSchema = z.object({
  id: z.number().optional(),
  userName: z
    .string()
    .min(1, { message: "Username is required" })
    .max(100, { message: "Username must be at most 100 characters" }),
  email: z
    .string()
    .email({ message: "Invalid email format" })
    .max(255, { message: "Email must be at most 255 characters" }),
  empCode: z.string().max(20).optional(),
  businessId: z.number().int(),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(255, { message: "Password must be at most 255 characters" }),
  mobile: z
    .string()
    .max(20, { message: "Mobile must be at most 20 characters" })
    .optional()
    .nullable(),
  departmentId: z.number().int().optional(),
  departmentName: z
    .string()
    .min(1, { message: "Department name is required" })
    .max(100, { message: "Department name must be at most 100 characters" }),
  hireDate: z.string().or(z.date()),
  isActive: z.boolean().default(true),
  createdAt: z.date().optional(),
  rolePermission: z.json().optional(),
});

// minium one item validate
const PurchaseItemListSchema = z.array(PurchaseItemSchema).min(1, {
  message: "At least one item is required",
});

const SearchSchema = z.object({
  businessId: z
    .number("businessId is required")
    .int("businessId must be an integer"),

  searchTerm: z.string().optional(),

  limit: z
    .number("limit is required")
    .int("limit must be an integer")
    .min(1, "limit must be at least 1")
    .max(100, "limit must be at most 100"),
});

const BusinessStatsSchema = z.object({
  id: z.number().optional(),
  businessId: z.number().int(),
  customers: z.number().int().default(0),
  items: z.number().int().default(0),
  employees: z.number().int().default(0),
  invoices: z.number().int().default(0),
  purchases: z.number().int().default(0),
  suppliers: z.number().int().default(0),
});

const ArchiveSchema = z.object({
  businessId: z
    .number("businessId is required")
    .int("businessId must be an integer"),

  id: z.number("id is required").int("id must be an integer"),

  isActive: z.boolean("isActive is required"),
});

export type TUserSchema = z.infer<typeof userSchema>;
export type TLoginSchema = z.infer<typeof loginSchema>;
export type TCustomerSchema = z.infer<typeof customerSchema>;
export type TItemSchema = z.infer<typeof itemSchema>;
export type TCodesSchema = z.infer<typeof codesSchema>;
export type TInvoiceMasterSchema = z.infer<typeof invoiceMasterSchema>;
export type TInvoiceDetailsSchema = z.infer<typeof invoiceDetailsSchema>;
export type TPurchaseClientSchema = z.infer<typeof purchaseClientSchema>;
export type TPurchaseSchema = z.infer<typeof PurchaseSchema>;
export type TPurchaseItemListSchema = z.infer<typeof PurchaseItemListSchema>;
export type TInvoiceItemsSchema = z.infer<typeof InvoiceItemsSchema>;
export type TDepartmentSchema = z.infer<typeof departmentSchema>;
export type TEmployeeSchema = z.infer<typeof employeeSchema>;
export type TInvoiceCustomerUpdateSchema = z.infer<
  typeof invoiceCustomerUpdateSchema
>;
export type TUserProfileSchema = z.infer<typeof userProfileSchema>;
export type TUpdateUserSchema = z.infer<typeof updateUserSchema>;
export type TSearchSchema = z.infer<typeof SearchSchema>;
export type TBusinessStatsSchema = z.infer<typeof BusinessStatsSchema>;
export type TArchiveSchema = z.infer<typeof ArchiveSchema>;

export {
  userSchema,
  loginSchema,
  customerSchema,
  itemSchema,
  codesSchema,
  invoiceMasterSchema,
  invoiceDetailsSchema,
  purchaseClientSchema,
  PurchaseSchema,
  PurchaseItemListSchema,
  InvoiceItemsSchema,
  departmentSchema,
  employeeSchema,
  invoiceCustomerUpdateSchema,
  userProfileSchema,
  updateUserSchema,
  SearchSchema,
  BusinessStatsSchema,
  ArchiveSchema,
};
