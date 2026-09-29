import Link from 'next/link'
import { MailCheck } from 'lucide-react'
import { AuthCard } from '@/components/auth-card'
import { Button } from '@/components/ui/button'

export default function SignUpSuccessPage() {
  return (
    <AuthCard
      title="Check your email"
      description="We sent you a confirmation link. Confirm your email, then sign in to start billing."
    >
      <MailCheck className="mx-auto size-12 text-success" aria-hidden />
      <Button asChild size="lg" className="h-12">
        <Link href="/auth/login">Back to sign in</Link>
      </Button>
    </AuthCard>
  )
}
