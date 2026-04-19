import { updateSession } from '@/lib/middleware'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow chat API only in CI/test mode
  if (
    process.env.ALLOW_TEST_BYPASS === 'true' &&
    pathname.startsWith('/api/chat')
  ) {
    return NextResponse.next()
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}