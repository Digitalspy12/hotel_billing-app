import { AuthCard } from '@/components/auth-card'
import { AuthForm } from '@/components/auth-form'

export default function SignUpPage() {
  return (
    <AuthCard title="Create staff account" description="The first account becomes the owner. Later accounts join as staff.">
      <AuthForm mode="signup" />
    </AuthCard>
  )
}
