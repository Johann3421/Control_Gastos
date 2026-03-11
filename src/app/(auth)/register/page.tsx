"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Zap } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { signIn } from "next-auth/react"

const registerSchema = z
  .object({
    name: z.string().min(2, "Mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Mínimo 6 caracteres"),
    confirmPassword: z.string(),
    currency: z.string().default("PEN"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })

type RegisterInput = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { currency: "PEN" },
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          currency: data.currency,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        toast.error(json.error ?? "Error al crear cuenta")
        return
      }
      await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      toast.success("¡Cuenta creada! Bienvenido a FlowTrack")
      router.push("/dashboard")
    } catch {
      toast.error("Ocurrió un error. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-dark-800 border border-surface-200 dark:border-dark-600 rounded-2xl shadow-card p-8"
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-ink-primary dark:text-ink-inverse">
          FlowTrack
        </span>
      </div>

      <h1 className="text-2xl font-bold text-ink-primary dark:text-ink-inverse text-center mb-1">
        Crea tu cuenta gratis
      </h1>
      <p className="text-sm text-ink-secondary text-center mb-6">
        Comienza a controlar tus finanzas hoy
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-secondary mb-1">
            Nombre
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Tu nombre"
            className="w-full px-4 py-2.5 bg-surface-50 dark:bg-dark-700 border border-surface-300 dark:border-dark-500 rounded-xl text-sm text-ink-primary dark:text-ink-inverse placeholder-ink-tertiary focus:outline-none focus:border-primary-500 transition-colors"
          />
          {errors.name && (
            <p className="text-xs text-expense-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-secondary mb-1">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="tu@email.com"
            className="w-full px-4 py-2.5 bg-surface-50 dark:bg-dark-700 border border-surface-300 dark:border-dark-500 rounded-xl text-sm text-ink-primary dark:text-ink-inverse placeholder-ink-tertiary focus:outline-none focus:border-primary-500 transition-colors"
          />
          {errors.email && (
            <p className="text-xs text-expense-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-10 bg-surface-50 dark:bg-dark-700 border border-surface-300 dark:border-dark-500 rounded-xl text-sm text-ink-primary dark:text-ink-inverse placeholder-ink-tertiary focus:outline-none focus:border-primary-500 transition-colors"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-expense-500 mt-1">{errors.password.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-secondary mb-1">
              Confirmar
            </label>
            <input
              {...register("confirmPassword")}
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 bg-surface-50 dark:bg-dark-700 border border-surface-300 dark:border-dark-500 rounded-xl text-sm text-ink-primary dark:text-ink-inverse placeholder-ink-tertiary focus:outline-none focus:border-primary-500 transition-colors"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-expense-500 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-secondary mb-1">
            Moneda preferida
          </label>
          <select
            {...register("currency")}
            className="w-full px-4 py-2.5 bg-surface-50 dark:bg-dark-700 border border-surface-300 dark:border-dark-500 rounded-xl text-sm text-ink-primary dark:text-ink-inverse focus:outline-none focus:border-primary-500 transition-colors"
          >
            <option value="PEN">S/ Sol peruano (PEN)</option>
            <option value="USD">$ Dólar (USD)</option>
            <option value="EUR">€ Euro (EUR)</option>
            <option value="BRL">R$ Real brasileño (BRL)</option>
            <option value="CLP">$ Peso chileno (CLP)</option>
            <option value="COP">$ Peso colombiano (COP)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors active:scale-95"
        >
          {isLoading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-sm text-ink-secondary mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link
          href="/login"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Inicia sesión
        </Link>
      </p>
    </motion.div>
  )
}
