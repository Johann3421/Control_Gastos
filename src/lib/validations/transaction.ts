import { z } from "zod"

export const transactionSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  type: z.enum(["INCOME", "EXPENSE", "SAVING", "INVESTMENT", "TRANSFER"]),
  description: z.string().min(1, "La descripción es requerida").max(200),
  notes: z.string().max(1000).optional(),
  date: z.coerce.date(),
  time: z.string().optional(),
  categoryId: z.string().cuid("Categoría inválida"),
  walletId: z.string().cuid("Billetera inválida"),
  tags: z.array(z.string()).default([]),
  goalId: z.string().cuid().optional().nullable(),
  isRecurring: z.boolean().default(false),
  recurringConfig: z
    .object({
      frequency: z.enum([
        "DAILY",
        "WEEKLY",
        "BIWEEKLY",
        "MONTHLY",
        "QUARTERLY",
        "YEARLY",
      ]),
      dayOfMonth: z.number().int().min(1).max(28).optional(),
      endDate: z.coerce.date().optional().nullable(),
    })
    .optional(),
})

export type TransactionInput = z.infer<typeof transactionSchema>

export const transactionUpdateSchema = transactionSchema.partial().extend({
  id: z.string().cuid(),
})

export type TransactionUpdateInput = z.infer<typeof transactionUpdateSchema>
