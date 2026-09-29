export const TIMEZONE = 'Asia/Kolkata'

export type PaymentMethod = 'cash' | 'upi' | 'other'
export const PAYMENT_METHODS: PaymentMethod[] = ['cash', 'upi', 'other']
export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  upi: 'UPI',
  other: 'Other',
}

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && (PAYMENT_METHODS as string[]).includes(value)
}

export function formatINR(paise: number) {
  const rupees = paise / 100
  return `₹${rupees.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function todayInIST() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIMEZONE }).format(new Date())
}

export function isISODate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value))
}

export function formatDate(value: string | Date) {
  const date = typeof value === 'string' && isISODate(value) ? new Date(`${value}T12:00:00+05:30`) : new Date(value)
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function formatShortDate(value: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

export function formatTime(value: string | Date) {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(value))
}

export function computeTotals(subtotal: number, cgstRate: number, sgstRate: number) {
  const cgst = Math.round((subtotal * cgstRate) / 100)
  const sgst = Math.round((subtotal * sgstRate) / 100)
  return { subtotal, cgst, sgst, total: subtotal + cgst + sgst }
}
