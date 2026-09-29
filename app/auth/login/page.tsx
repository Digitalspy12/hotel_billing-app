import { AuthCard } from '@/components/auth-card'
import { AuthForm } from '@/components/auth-form'

export default function LoginPage() {
  return (
    <AuthCard title="Staff sign in" description="Sign in to manage tables, orders and bills.">
      <AuthForm mode="login" />
    </AuthCard>
  )
}
