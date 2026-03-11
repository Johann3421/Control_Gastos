import {
  WalletType,
  TransactionType,
  BudgetPeriod,
  GoalStatus,
  RecurrenceFrequency,
} from "@prisma/client"

export type {
  WalletType,
  TransactionType,
  BudgetPeriod,
  GoalStatus,
  RecurrenceFrequency,
}

export interface TransactionWithRelations {
  id: string
  amount: number
  type: TransactionType
  description: string
  notes?: string | null
  date: Date
  time?: string | null
  isRecurring: boolean
  tags: string[]
  attachments: string[]
  categoryId: string
  category: {
    id: string
    name: string
    icon: string
    color: string
    type: TransactionType
  }
  walletId: string
  wallet: {
    id: string
    name: string
    icon: string
    color: string
    type: WalletType
  }
  userId: string
  recurringId?: string | null
  goalId?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CategoryWithStats {
  id: string
  name: string
  type: TransactionType
  icon: string
  color: string
  parentId?: string | null
  isDefault: boolean
  userId: string
  total?: number
  count?: number
  percentage?: number
}

export interface WalletWithBalance {
  id: string
  name: string
  type: WalletType
  balance: number
  currency: string
  color: string
  icon: string
  isDefault: boolean
  includeInTotal: boolean
  userId: string
}

export interface BudgetWithUsage {
  id: string
  name: string
  amount: number
  period: BudgetPeriod
  startDate: Date
  endDate?: Date | null
  rollover: boolean
  alertAt: number
  categoryId?: string | null
  category?: {
    id: string
    name: string
    icon: string
    color: string
  } | null
  spent: number
  percentageUsed: number
  isOverBudget: boolean
}

export interface GoalWithProgress {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  currency: string
  deadline?: Date | null
  icon: string
  color: string
  status: GoalStatus
  userId: string
  daysLeft?: number | null
  monthlyRequired?: number | null
  percentage: number
  progressPercentage: number
}

export interface DashboardStats {
  totalIncome: number
  totalExpense: number
  totalSaving?: number
  totalInvestment?: number
  netSaving: number
  savingRate: number
  transactionCount: number
  incomeCount: number
  expenseCount: number
  incomeChange: number
  expenseChange: number
  categoryBreakdown: Array<{
    id: string
    name: string
    color: string
    icon: string
    total: number
  }>
  biggestExpenseCategory: {
    id: string
    name: string
    color: string
    icon: string
    total: number
  } | null
  dailyAverage: number
  recentTransactions: TransactionWithRelations[]
  // Fields added by dashboard page
  totalBalance: number
  monthIncome: number
  monthExpenses: number
  monthSavings: number
  monthInvestments: number
}

export interface MonthlyChartData {
  month: string
  income: number
  expense: number
  balance: number
}

export interface FilterState {
  period: string
  startDate?: Date
  endDate?: Date
  type?: TransactionType | "ALL"
  categoryIds: string[]
  walletIds: string[]
  search: string
  minAmount?: number
  maxAmount?: number
  tags: string[]
  isRecurring?: boolean
}
