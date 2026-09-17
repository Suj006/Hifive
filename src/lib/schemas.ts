import { z } from "zod";

export const itemTypeSchema = z.enum(["RAW_MATERIAL", "PRODUCT"]);

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

export const saleSchema = z.object({
  date: z.coerce.date(),
  itemId: z.string().min(1, "Product is required"),
  customerId: z.string().min(1, "Customer is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than 0"),
  rate: z.coerce.number().min(0, "Rate cannot be negative"),
  discount: z.coerce.number().min(0).default(0),
  amount: z.coerce.number().min(0, "Amount cannot be negative"),
  invoiceNumber: z.string().trim().max(60).optional().or(z.literal("")),
  paymentMode: z.string().trim().max(30).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
