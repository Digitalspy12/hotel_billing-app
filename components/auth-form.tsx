'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function describeError(error: { message?: string; code?: string; status?: number }, mode: 'login' | 'signup') {
  const code = error.code ?? ''
  if (code === 'email_not_confirmed') return 'Please confirm your email address before signing in.'
  if (code === 'weak_password') return 'Password is too weak. Use at least 8 characters.'
  if (code.includes('rate_limit') || error.status === 429) return 'Too many attempts. Please wait a moment and try again.'
  if (code === 'email_address_invalid') return 'Please enter a valid email address.'
  if (mode === 'login' && (code === 'invalid_credentials' || error.status === 400)) return 'Invalid email or password.'
  return 'Something went wrong. Please try again.'
}

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    const fullName = String(form.get('fullName') ?? '').trim()

    if (mode === 'signup' && password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(describeError(error, mode))
        setLoading(false)
        return
      }
      router.replace('/')
      router.refresh()
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo:
          process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ?? `${window.location.origin}/auth/callback`,
        data: { full_name: fullName },
      },
    })
    if (error) {
      setError(describeError(error, mode))
      setLoading(false)
      return
    }
    router.push('/auth/sign-up-success')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {mode === 'signup' && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" autoComplete="name" required maxLength={80} className="h-11" />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required className="h-11" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
          minLength={mode === 'signup' ? 8 : undefined}
          className="h-11"
        />
      </div>
      {error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="h-12 text-base" disabled={loading}>
        {loading && <Loader2 className="animate-spin" aria-hidden />}
        {mode === 'login' ? 'Sign in' : 'Create staff account'}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {mode === 'login' ? (
          <>
            {'New staff member? '}
            <Link href="/auth/sign-up" className="font-medium text-primary underline-offset-4 hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            {'Already have an account? '}
            <Link href="/auth/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  )
}
