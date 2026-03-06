"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Zap } from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
})
type LoginInput = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      })
      if (result?.error) {
        toast.error("Credenciales incorrectas. Verifica tu email y contraseña.")
      } else {
        router.push("/dashboard")
        router.refresh()
      }
    } catch {
      toast.error("Ocurrió un error. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => signIn("google", { callbackUrl: "/dashboard" })

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-dark-800 border border-surface-200 dark:border-dark-600 rounded-2xl shadow-card p-8"
    >
      {/* Logo */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-xl bg-primary-500 flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold text-ink-primary dark:text-ink-inverse">
          FlowTrack
        </span>
      </div>

      <h1 className="text-2xl font-bold text-ink-primary dark:text-ink-inverse text-center mb-1">
        Bienvenido de vuelta
      </h1>
      <p className="text-sm text-ink-secondary text-center mb-6">
        Continúa controlando tus finanzas
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink-secondary mb-1">
            Email
          </label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="tu@email.com"
            className="w-full px-4 py-2.5 bg-surface-50 dark:bg-dark-700 border border-surface-300 dark:border-dark-500 rounded-xl text-sm text-ink-primary dark:text-ink-inverse placeholder-ink-tertiary focus:outline-none focus:border-primary-500 transition-colors"
          />
          {errors.email && (
            <p className="text-xs text-expense-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-ink-secondary mb-1">
            Contraseña
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-2.5 pr-10 bg-surface-50 dark:bg-dark-700 border border-surface-300 dark:border-dark-500 rounded-xl text-sm text-ink-primary dark:text-ink-inverse placeholder-ink-tertiary focus:outline-none focus:border-primary-500 transition-colors"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary hover:text-ink-secondary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-expense-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white font-semibold rounded-xl transition-colors active:scale-95"
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-surface-200 dark:bg-dark-600" />
        <span className="text-xs text-ink-tertiary">o</span>
        <div className="flex-1 h-px bg-surface-200 dark:bg-dark-600" />
      </div>

      <button
        onClick={handleGoogleSignIn}
        className="w-full py-2.5 border border-surface-300 dark:border-dark-500 rounded-xl text-sm font-medium text-ink-primary dark:text-ink-inverse hover:bg-surface-50 dark:hover:bg-dark-700 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continuar con Google
      </button>

      <p className="text-center text-sm text-ink-secondary mt-6">
        ¿No tienes cuenta?{" "}
        <Link
          href="/register"
          className="text-primary-600 hover:text-primary-700 font-medium"
        >
          Regístrate
        </Link>
      </p>

      {/* Demo credentials */}
      <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-500/10 rounded-xl border border-primary-100 dark:border-primary-500/20">
        <p className="text-xs text-primary-700 dark:text-primary-400 font-medium mb-1">
          Usuario demo
        </p>
        <p className="text-xs text-primary-600 dark:text-primary-400">
          demo@flowtrack.app / Demo123!
        </p>
      </div>
    </motion.div>
  )
}
