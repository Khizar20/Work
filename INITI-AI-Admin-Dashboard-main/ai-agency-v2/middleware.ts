import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '@/app/utils/database.types';

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          res.cookies.set(name, value, options);
        },
        remove(name, options) {
          res.cookies.set(name, '', options);
        },
      },
    }
  );

  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Session error in middleware:', error);
    }

    const { pathname } = req.nextUrl;
    const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
    const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
    const isRedirectLoop = pathname.startsWith('/login') && req.nextUrl.searchParams.has('redirectedFrom');

    // Allow reset-password page to be accessed without session
    if (pathname === '/reset-password') {
      return res;
    }

    if (!session && !isPublicRoute && !isRedirectLoop) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Only redirect to dashboard if user is trying to access login/register pages
    // Don't redirect from forgot-password or reset-password
    if (session && (pathname === '/login' || pathname === '/register')) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }

    if (session && pathname === '/') {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/dashboard';
      return NextResponse.redirect(redirectUrl);
    }
  } catch (error) {
    console.error('Error in middleware:', error);
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|api/|favicon.ico|assets/|.*\\.(?:jpg|jpeg|gif|png|svg|ico)$).*)',
  ],
};
