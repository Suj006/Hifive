import { z } from "zod";

export const itemTypeSchema = z.enum(["RAW_MATERIAL", "PRODUCT"]);

export const loginSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(60),
  password: z.string().min(1, "Password is required").max(200),
});

export const userRoleSchema = z.enum(["ADMIN", "VIEWER"]);

export const createUserSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(60),
  password: z.string().min(6, "Password must be at least 6 characters").max(200),
  role: userRoleSchema.default("VIEWER"),
});

export const updateUserSchema = z.object({
  role: userRoleSchema.optional(),
  password: z.string().min(6, "Password must be at least 6 characters").max(200).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required").max(200),
    newPassword: z.string().min(6, "New password must be at least 6 characters").max(200),
    confirmPassword: z.string().min(1, "Please confirm the new password").max(200),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation don't match",
    path: ["confirmPassword"],
  });

export const itemSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  type: itemTypeSchema,
  unit: z.string().trim().min(1, "Unit is required").max(30),
  group: z.string().trim().max(80).optional().or(z.literal("")),
  categoryId: z.string().trim().min(1).optional().or(z.literal("")),
  openingStock: z.coerce.number().min(0).default(0),
  reorderLevel: z.coerce.number().min(0).default(0),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  isActive: z.coerce.boolean().default(true),
});

export const productNameSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  isActive: z.coerce.boolean().default(true),
});

export const productionSchema = z.object({
  date: z.coerce.date(),
  itemId: z.string().min(1, "Product is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const partySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  phone: z
    .string()
    .trim()
    .max(20)
    .optional()
    .or(z.literal("")),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
});

export const purchaseSchema = z.object({
  date: z.coerce.date(),
  itemId: z.string().min(1, "Raw material is required"),
  vendorId: z.string().min(1, "Vendor is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  rate: z.coerce.number().min(0, "Rate cannot be negative"),
  amount: z.coerce.number().min(0, "Amount cannot be negative"),
  invoiceNumber: z.string().trim().max(60).optional().or(z.literal("")),
  paymentMode: z.string().trim().max(30).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

export const expenseSchema = z.object({
  date: z.coerce.date(),
  category: z.string().trim().min(1, "Category is required").max(60),
  description: z.string().trim().min(1, "Description is required").max(200),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  paymentMode: z.string().trim().max(30).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});

// invoiceNumber is deliberately absent here — it's generated server-side
// (see src/lib/invoice-number.ts) and never accepted from the client, so
// every sale gets one automatically instead of relying on manual entry.
export const saleSchema = z
  .object({
    date: z.coerce.date(),
    itemId: z.string().min(1, "Product is required"),
    customerId: z.string().min(1, "Customer is required"),
    quantity: z.coerce.number().positive("Quantity must be greater than 0"),
    rate: z.coerce.number().min(0, "Rate cannot be negative"),
    discount: z.coerce.number().min(0).default(0),
    amount: z.coerce.number().min(0, "Amount cannot be negative"),
    // Optional — omitted (or left blank) means "paid in full", handled by
    // the route itself so callers that don't know about dues yet still work.
    amountPaid: z.coerce.number().min(0, "Amount received cannot be negative").optional(),
    paymentMode: z.string().trim().max(30).optional().or(z.literal("")),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
  })
  .refine((data) => data.amountPaid === undefined || data.amountPaid <= data.amount, {
    message: "Amount received can't be more than the sale amount",
    path: ["amountPaid"],
  });

export const recordPaymentSchema = z.object({
  amount: z.coerce.number().positive("Payment amount must be greater than 0"),
});
