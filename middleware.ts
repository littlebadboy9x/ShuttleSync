import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Kiểm tra các routes cần authentication
  if (pathname.startsWith('/customer') || pathname.startsWith('/admin')) {
    // Lấy token từ cookie hoặc header (client-side sẽ handle localStorage)
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '')

    // Nếu đang ở trang login và đã có token, redirect về dashboard
    if (pathname === '/login' && token) {
      return NextResponse.redirect(new URL('/customer/dashboard', request.url))
    }

    // Nếu không có token và không phải trang login, redirect về login
    if (!token && pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/customer/:path*',
    '/admin/:path*',
    '/login'
  ]
} 