"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArchiveSchema = exports.BusinessStatsSchema = exports.SearchSchema = exports.updateUserSchema = exports.userProfileSchema = exports.invoiceCustomerUpdateSchema = exports.employeeSchema = exports.departmentSchema = exports.InvoiceItemsSchema = exports.PurchaseItemListSchema = exports.PurchaseSchema = exports.purchaseClientSchema = exports.invoiceDetailsSchema = exports.invoiceMasterSchema = exports.codesSchema = exports.itemSchema = exports.customerSchema = exports.loginSchema = exports.userSchema = void 0;
const zod_1 = require("zod");
const userSchema = zod_1.z.object({
    email: zod_1.z.string().min(5).max(255).email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
    mobile: zod_1.z
        .string()
        .min(10, "Mobile must be at least 10 characters")
        .min(7, "Mobile too short"),
    firstName: zod_1.z.string().min(1, "First name is required").max(100),
    lastName: zod_1.z.string().min(1, "Last name is required").max(100),
});
exports.userSchema = userSchema;
const updateUserSchema = zod_1.z.object({
    mobile: zod_1.z
        .string()
        .regex(/^[0-9]+$/, { message: "Contact number must be numeric" }),
    firstName: zod_1.z.string().min(1, "First name is required").max(100),
    lastName: zod_1.z.string().min(1, "Last name is required").max(100),
});
exports.updateUserSchema = updateUserSchema;
const userProfileSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    address: zod_1.z.string().optional().nullable(),
    avatar: zod_1.z.string().optional().nullable(),
    organization: zod_1.z.string().optional().nullable(),
    contactNumber: zod_1.z.string().optional().nullable(),
    contactEmail: zod_1.z.string().optional().nullable(),
    website: zod_1.z.string().optional().nullable(),
    country: zod_1.z.string().optional().nullable(),
    state: zod_1.z.string().optional().nullable(),
    city: zod_1.z.string().optional().nullable(),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
    businessId: zod_1.z.number().int(),
    userId: zod_1.z.number().int(),
    about: zod_1.z
        .string()
        .max(500, {
        message: "About must be at most 500 characters",
    })
        .optional(),
});
exports.userProfileSchema = userProfileSchema;
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().min(5).max(255).email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters"),
});
exports.loginSchema = loginSchema;
const customerSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    name: zod_1.z
        .string()
        .min(1, { message: "name is required" })
        .max(255, { message: "max value 250 character" }),
    email: zod_1.z.string().email().max(255, { message: "max value 250 character" }),
    phone: zod_1.z.string().max(20).optional().nullable(),
    cusCode: zod_1.z.string().optional().nullable(),
    address: zod_1.z
        .string()
        .max(500, { message: "max value 500 character" })
        .optional()
        .nullable(),
    city: zod_1.z.string().max(100).optional().nullable(),
    state: zod_1.z.string().max(100).optional().nullable(),
    country: zod_1.z.string().max(100).optional().nullable(),
    postalCode: zod_1.z.string().max(20).optional().nullable(),
    isActive: zod_1.z.boolean().optional(),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
    businessId: zod_1.z.number().int(),
});
exports.customerSchema = customerSchema;
const itemSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, { message: "name is required" })
        .max(255, { message: "max value 250 character" }),
    description: zod_1.z.string().max(1000, { message: "max value 1000 character." }),
    category: zod_1.z
        .string()
        .min(1, { message: "name is required" })
        .max(100, { message: "max value 100 character" }),
    proCode: zod_1.z
        .string()
        .max(20, { message: "max value 20 character" })
        .optional()
        .nullable(),
    sku: zod_1.z
        .string()
        .max(100, { message: "SKU must be at most 100 characters." })
        .optional()
        .nullable(),
    unitPrice: zod_1.z.number().int({ message: "Unit price must be an integer" }),
    costPrice: zod_1.z.number().int({ message: "Cost price must be an integer" }),
    unit: zod_1.z
        .string()
        .max(20, { message: "Unit must be at most 20 characters." })
        .default("pcs"),
    taxRate: zod_1.z
        .number()
        .int({ message: "Tax rate must be an integer" })
        .default(0),
    discountRate: zod_1.z
        .number()
        .int({ message: "Discount rate must be an integer" })
        .default(0),
    image: zod_1.z
        .string()
        .max(256, { message: "Image must be at most 256 characters." })
        .default(""),
    catId: zod_1.z.number().int(),
    stockQuantity: zod_1.z.number().int().default(0),
    minStockLevel: zod_1.z.number().int().default(0),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
    businessId: zod_1.z.number().int(),
});
exports.itemSchema = itemSchema;
const codesSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    businessId: zod_1.z.number(),
    codeType: zod_1.z
        .string()
        .min(1, { message: "Code type cannot be empty" })
        .max(50, { message: "Code type must be at most 50 characters" }),
    codeName: zod_1.z
        .string()
        .trim()
        .min(1, { message: "Code name cannot be empty" })
        .max(50, { message: "Code name must be at most 50 characters" }),
    codeDesc: zod_1.z
        .string()
        .trim()
        .max(150, { message: "Code description must be at most 150 characters" })
        .optional(),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
    longDesc: zod_1.z.json().optional(),
});
exports.codesSchema = codesSchema;
const invoiceMasterSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    invoiceNumber: zod_1.z.string().optional().nullable(),
    customerId: zod_1.z.number().optional().nullable(),
    customerPhone: zod_1.z
        .string()
        .min(1, { message: "Customer Phone number required" }),
    businessId: zod_1.z.number().int({ message: "Business ID must be an integer" }),
    customerName: zod_1.z.string().max(100).optional(),
    customerEmail: zod_1.z.string().max(100).optional(),
    customerAddress: zod_1.z.string().max(255).optional(),
    invoiceDate: zod_1.z.string().optional().nullable(),
    dueDate: zod_1.z.string().optional().nullable(),
    subtotal: zod_1.z.number().int({ message: "Subtotal must be an integer" }),
    tax: zod_1.z.number().int({ message: "Tax must be an integer" }),
    discount: zod_1.z.number().int({ message: "Discount must be an integer" }),
    deliveryCharge: zod_1.z
        .number()
        .int({ message: "Delivery charge must be an integer" }),
    totalAmount: zod_1.z.number().int({ message: "Total amount must be an integer" }),
    status: zod_1.z
        .enum(["paid", "credit", "unpaid", "archive"], {
        message: "Status must be one of: paid, credit, unpaid, archive",
    })
        .default("unpaid"),
    notes: zod_1.z.string().optional().nullable(),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
    createdBy: zod_1.z.number().int({ message: "Created by must be an integer" }),
    paymentInfo: zod_1.z.object().optional(),
});
exports.invoiceMasterSchema = invoiceMasterSchema;
const invoiceCustomerUpdateSchema = zod_1.z.object({
    customerId: zod_1.z.number().optional().nullable(),
    customerPhone: zod_1.z
        .string()
        .min(1, { message: "Customer Phone number required" })
        .max(20, { message: "max value 20 character" }),
    customerName: zod_1.z
        .string()
        .max(100, { message: "max value 100 character" })
        .optional(),
    customerEmail: zod_1.z
        .string()
        .max(100, { message: "max value 100 character" })
        .optional(),
    customerAddress: zod_1.z
        .string()
        .max(255, { message: "max value 255 character" })
        .optional(),
});
exports.invoiceCustomerUpdateSchema = invoiceCustomerUpdateSchema;
const invoiceDetailsSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    invoiceMasterId: zod_1.z.number().optional().nullable(),
    itemId: zod_1.z.number().int(),
    itemName: zod_1.z
        .string()
        .min(1, { message: "Item name is required" })
        .max(255, { message: "Item name must be at most 255 characters" }),
    description: zod_1.z.string().optional().nullable(),
    quantity: zod_1.z.number().int({ message: "Quantity must be an integer" }),
    unitPrice: zod_1.z.number().int({ message: "Unit price must be an integer" }),
    tax: zod_1.z.number().default(0),
    discount: zod_1.z
        .number()
        .int({ message: "Discount must be an integer" })
        .default(0),
    lineTotal: zod_1.z
        .number()
        .int({ message: "Line total must be an integer" })
        .default(0),
    businessId: zod_1.z.number().int({ message: "Business ID must be an integer" }),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
});
exports.invoiceDetailsSchema = invoiceDetailsSchema;
const InvoiceItemsSchema = zod_1.z.array(invoiceDetailsSchema).min(1, {
    message: "At least one invoice item is required",
});
exports.InvoiceItemsSchema = InvoiceItemsSchema;
const purchaseClientSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    name: zod_1.z
        .string()
        .min(1, { message: "name is required" })
        .max(255, { message: "max value 250 character" }),
    email: zod_1.z.string().email().max(255, { message: "max value 250 character" }),
    phone: zod_1.z.string().max(20).optional().nullable(),
    address: zod_1.z
        .string()
        .max(500, { message: "max value 500 character" })
        .optional()
        .nullable(),
    city: zod_1.z.string().max(100).optional().nullable(),
    state: zod_1.z.string().max(100).optional().nullable(),
    country: zod_1.z.string().max(100).optional().nullable(),
    postalCode: zod_1.z.string().max(20).optional().nullable(),
    contactPerson: zod_1.z.string().max(255).optional().nullable(),
    taxId: zod_1.z.string().max(50).optional().nullable(),
    paymentTerms: zod_1.z.string().max(100).optional().nullable(),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
    businessId: zod_1.z.number().int(),
});
exports.purchaseClientSchema = purchaseClientSchema;
const PurchaseSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    purchaseNumber: zod_1.z.string().optional().nullable(),
    supplierId: zod_1.z.number(),
    supplierName: zod_1.z.string(),
    supplierEmail: zod_1.z.string(),
    supplierAddress: zod_1.z.string().max(255).optional().nullable(),
    supplierPhone: zod_1.z.string().max(20).optional().nullable(),
    businessId: zod_1.z.number(),
    purchaseDate: zod_1.z.string(),
    expectedDeliveryDate: zod_1.z.string().optional(),
    actualDeliveryDate: zod_1.z.string().optional(),
    subtotal: zod_1.z.number(),
    taxAmount: zod_1.z.number().optional().default(0),
    discountAmount: zod_1.z.number().optional().default(0),
    shippingCost: zod_1.z.number().optional().default(0),
    totalAmount: zod_1.z.number(),
    status: zod_1.z
        .enum(["pending", "ordered", "received", "cancelled", "credit", "paid"])
        .optional()
        .default("pending"),
    paymentStatus: zod_1.z
        .enum(["unpaid", "partial", "paid"])
        .optional()
        .default("unpaid"),
    notes: zod_1.z.string().optional(),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
    createdBy: zod_1.z.number(),
});
exports.PurchaseSchema = PurchaseSchema;
const PurchaseItemSchema = zod_1.z.object({
    id: zod_1.z.number().optional().nullable(),
    purchaseId: zod_1.z.number().optional().nullable(),
    itemId: zod_1.z.number(),
    itemName: zod_1.z.string(),
    quantity: zod_1.z
        .number({ message: "Quantity must be a number" })
        .int({ message: "Quantity must be an integer" }),
    lineTotal: zod_1.z
        .number({ message: "Line total must be a number" })
        .int({ message: "Line total must be an integer" }),
    businessId: zod_1.z.number(),
    unitPrice: zod_1.z
        .number({ message: "Unit price must be a number" })
        .int({ message: "Unit price must be an integer" })
        .optional()
        .nullable(),
    unitCost: zod_1.z
        .number({ message: "Unit cost must be a number" })
        .int({ message: "Unit cost must be an integer" })
        .optional()
        .nullable(),
    receivedQuantity: zod_1.z
        .number({ message: "Received quantity must be a number" })
        .optional()
        .nullable(),
    createdAt: zod_1.z.date().optional(),
    updatedAt: zod_1.z.date().optional(),
});
const departmentSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    name: zod_1.z.string().min(1, { message: "Department name is required" }).max(100),
    deptCode: zod_1.z.string().optional(),
    businessId: zod_1.z.number().int(),
    createdAt: zod_1.z.string().or(zod_1.z.date()).optional(),
});
exports.departmentSchema = departmentSchema;
const employeeSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    userName: zod_1.z
        .string()
        .min(1, { message: "Username is required" })
        .max(100, { message: "Username must be at most 100 characters" }),
    email: zod_1.z
        .string()
        .email({ message: "Invalid email format" })
        .max(255, { message: "Email must be at most 255 characters" }),
    empCode: zod_1.z.string().max(20).optional(),
    businessId: zod_1.z.number().int(),
    password: zod_1.z
        .string()
        .min(6, { message: "Password must be at least 6 characters" })
        .max(255, { message: "Password must be at most 255 characters" }),
    mobile: zod_1.z
        .string()
        .max(20, { message: "Mobile must be at most 20 characters" })
        .optional()
        .nullable(),
    departmentId: zod_1.z.number().int().optional(),
    departmentName: zod_1.z
        .string()
        .min(1, { message: "Department name is required" })
        .max(100, { message: "Department name must be at most 100 characters" }),
    hireDate: zod_1.z.string().or(zod_1.z.date()),
    isActive: zod_1.z.boolean().default(true),
    createdAt: zod_1.z.date().optional(),
    rolePermission: zod_1.z.json().optional(),
});
exports.employeeSchema = employeeSchema;
const PurchaseItemListSchema = zod_1.z.array(PurchaseItemSchema).min(1, {
    message: "At least one item is required",
});
exports.PurchaseItemListSchema = PurchaseItemListSchema;
const SearchSchema = zod_1.z.object({
    businessId: zod_1.z
        .number("businessId is required")
        .int("businessId must be an integer"),
    searchTerm: zod_1.z.string().optional(),
    limit: zod_1.z
        .number("limit is required")
        .int("limit must be an integer")
        .min(1, "limit must be at least 1")
        .max(100, "limit must be at most 100"),
});
exports.SearchSchema = SearchSchema;
const BusinessStatsSchema = zod_1.z.object({
    id: zod_1.z.number().optional(),
    businessId: zod_1.z.number().int(),
    customers: zod_1.z.number().int().default(0),
    items: zod_1.z.number().int().default(0),
    employees: zod_1.z.number().int().default(0),
    invoices: zod_1.z.number().int().default(0),
    purchases: zod_1.z.number().int().default(0),
    suppliers: zod_1.z.number().int().default(0),
});
exports.BusinessStatsSchema = BusinessStatsSchema;
const ArchiveSchema = zod_1.z.object({
    businessId: zod_1.z
        .number("businessId is required")
        .int("businessId must be an integer"),
    id: zod_1.z.number("id is required").int("id must be an integer"),
    isActive: zod_1.z.boolean("isActive is required"),
});
exports.ArchiveSchema = ArchiveSchema;
//# sourceMappingURL=validate.js.map