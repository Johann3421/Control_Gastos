import { z } from "zod"

export const budgetSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  period: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY", "CUSTOM"]),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  rollover: z.boolean().default(false),
  alertAt: z.number().int().min(1).max(100).default(80),
  categoryId: z.string().cuid().optional().nullable(),
})

export type BudgetInput = z.infer<typeof budgetSchema>
