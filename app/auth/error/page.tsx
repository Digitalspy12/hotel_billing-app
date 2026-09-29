import Link from 'next/link'
import { AuthCard } from '@/components/auth-card'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <AuthCard title="Sign-in link problem" description="This link is invalid or has expired. Please sign in again.">
      <Button asChild size="lg" className="h-12">
        <Link href="/auth/login">Back to sign in</Link>
      </Button>
    </AuthCard>
  )
}
