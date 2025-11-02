import { z } from "zod";

export const createTableSchema = z.object({
  name: z.string().min(1),
  capacity: z.number().int().min(1),
  isActive: z.boolean().optional()
});

export const createBookingSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(8),
  customerEmail: z.string().email().optional(),
  partySize: z.number().int().min(1),
  time: z.string().datetime(), // ISO string
  tableId: z.string().min(1),
  note: z.string().optional()
});
