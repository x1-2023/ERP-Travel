/**
 * Zod Validation Schemas (Zod v4)
 */

import { z } from "zod";

// ============================================
// PROMOTION SCHEMAS
// ============================================

export const promotionFormSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be 50 characters or less")
    .regex(/^[A-Z0-9-]+$/, "Code must be uppercase letters, numbers, and hyphens only"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or less"),
  description: z.string().optional(),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date({ message: "End date is required" }),
  budget: z
    .number({ message: "Budget must be a number" })
    .positive("Budget must be positive"),
  customerId: z.string().min(1, "Customer is required"),
  fundId: z.string().min(1, "Fund is required"),
  promotionType: z.enum([
    "TRADE_PROMOTION",
    "CONSUMER_PROMOTION",
    "SHOPPER_MARKETING",
    "DISPLAY",
    "LISTING_FEE",
  ] as const, { message: "Promotion type is required" }),
  mechanicType: z.enum([
    "DISCOUNT",
    "REBATE",
    "FREE_GOODS",
    "BOGO",
    "BUNDLE",
    "LOYALTY_POINTS",
  ] as const).optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type PromotionFormValues = z.infer<typeof promotionFormSchema>;

// ============================================
// CLAIM SCHEMAS
// ============================================

export const claimFormSchema = z.object({
  promotionId: z.string().min(1, "Promotion is required"),
  claimDate: z.date({ message: "Claim date is required" }),
  claimAmount: z
    .number({ message: "Claim amount must be a number" })
    .positive("Claim amount must be positive"),
  description: z.string().optional(),
  invoiceNumber: z.string().optional(),
  evidenceUrls: z.array(z.string().url()).optional(),
});

export type ClaimFormValues = z.infer<typeof claimFormSchema>;

// ============================================
// FUND SCHEMAS
// ============================================

export const fundFormSchema = z.object({
  code: z
    .string()
    .min(1, "Code is required")
    .max(50, "Code must be 50 characters or less")
    .regex(/^[A-Z0-9-]+$/, "Code must be uppercase letters, numbers, and hyphens only"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(200, "Name must be 200 characters or less"),
  description: z.string().optional(),
  totalBudget: z
    .number({ message: "Total budget must be a number" })
    .positive("Total budget must be positive"),
  startDate: z.date({ message: "Start date is required" }),
  endDate: z.date({ message: "End date is required" }),
  fundType: z.enum([
    "TRADE_FUND",
    "MARKETING_FUND",
    "PROMOTIONAL_FUND",
    "CO_OP_FUND",
  ] as const, { message: "Fund type is required" }),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type FundFormValues = z.infer<typeof fundFormSchema>;
