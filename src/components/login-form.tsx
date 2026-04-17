'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push('/chat')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFillDemo = () => {
    setEmail('samit@email.com')
    setPassword('123456')
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="border-sky-100 shadow-lg shadow-sky-100/30 dark:border-slate-800 dark:shadow-none">
        <CardHeader className="pb-4">
          {/* Logo mark */}
          <div className="flex justify-center mb-4">
            <div className="h-12 px-5 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center shadow-md shadow-sky-200 dark:shadow-sky-900/40 whitespace-nowrap">
              <span className="text-white font-bold text-lg">BKK AI</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-slate-800 dark:text-white">Login</CardTitle>
          <CardDescription className="text-center text-slate-400 dark:text-slate-500">Enter your email and password to login</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-5">
              <div className="grid gap-1.5">
                <Label htmlFor="email" className="text-slate-600 dark:text-slate-300 text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  tabIndex={1}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-sky-200 dark:border-slate-700 focus:border-sky-400 focus:ring-sky-200 dark:bg-slate-800 rounded-lg"
                />
              </div>
              <div className="grid gap-1.5">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-slate-600 dark:text-slate-300 text-sm font-medium">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto text-xs text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 underline-offset-4 hover:underline transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  tabIndex={2}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-sky-200 dark:border-slate-700 focus:border-sky-400 focus:ring-sky-200 dark:bg-slate-800 rounded-lg"
                />
              </div>
              {error && (
                <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                tabIndex={3}
                className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-lg font-semibold py-2.5 shadow-md shadow-sky-200 dark:shadow-sky-900/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                    Logging in...
                  </span>
                ) : 'Login'}
              </Button>
            </div>
            <div className="mt-5 text-center text-sm text-slate-400">
              Don't have an account?{' '}
              <Link href="/auth/sign-up" className="text-sky-500 hover:text-sky-700 dark:text-sky-400 font-medium underline-offset-4 hover:underline transition-colors">
                Sign Up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
