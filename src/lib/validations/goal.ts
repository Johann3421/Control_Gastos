import { z } from "zod"

export const goalSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  targetAmount: z.coerce.number().positive("El monto objetivo debe ser positivo"),
  currency: z.string().default("PEN"),
  deadline: z.coerce.date().optional().nullable(),
  icon: z.string().default("target"),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color inválido")
    .default("#6366f1"),
})

export type GoalInput = z.infer<typeof goalSchema>

export const goalDepositSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser positivo"),
  walletId: z.string().cuid("Billetera inválida"),
  categoryId: z.string().cuid("Categoría inválida"),
  notes: z.string().optional(),
})

export type GoalDepositInput = z.infer<typeof goalDepositSchema>
