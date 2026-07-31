import { auth } from '@/lib/auth/authConfig';
import { NextResponse } from 'next/server';
import type { NextAuthRequest } from 'next-auth';

export default auth((req: NextAuthRequest) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const protectedPaths = ['/dashboard', '/vault'];
  const isProtected = protectedPaths.some((path) =>
    nextUrl.pathname.startsWith(path),
  );

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL('/api/auth/signin', nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/dashboard/:path*', '/vault/:path*', '/api/vault/:path*'],
};
