import { NextResponse, type NextRequest } from 'next/server';

// Cheap redirect based on whether a session cookie exists. The app still checks the
// session with the API and logs out (clearing the cookie) if it has expired.
export function middleware(req: NextRequest) {
  const signedIn = req.cookies.has('sid');
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/app') && !signedIn) {
    const url = new URL('/login', req.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }
  if ((pathname === '/login' || pathname === '/signup') && signedIn) {
    return NextResponse.redirect(new URL('/app', req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/login', '/signup'],
};
