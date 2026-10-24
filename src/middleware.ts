import { NextResponse } from 'next/server';
import { NextRequest, NextResponse } from 'next/server';
// Define route permissions for each portal prefix
const ROLE_PERMISSIONS: Record<string, string[]> = {
  '/system-owner': ['system_owner'],
  '/admin':        ['system_owner', 'uni_admin'],
  '/staff':        ['system_owner', 'uni_admin', 'staff'],
  '/voter':        ['voter'],
  '/observer':     ['system_owner', 'uni_admin', 'staff', 'voter', 'observer'],
};

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // Identify which protected prefix the user is visiting
  const matchedPath = Object.keys(ROLE_PERMISSIONS).find((path) =>
    pathname.startsWith(path)
  );

  // Unprotected routes (like /login or public homepage) pass through
  if (!matchedPath) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users to login
  if (!token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Extract role from JWT token payload
  const userRole = getUserRoleFromToken(token);
  const allowedRoles = ROLE_PERMISSIONS[matchedPath];

  // Redirect unauthorized roles
  if (!userRole || !allowedRoles.includes(userRole)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }

  return NextResponse.next();
}

/**
 * Parses JWT token without heavy node dependencies (Edge Runtime compliant)
 */
function getUserRoleFromToken(token: string): string | null {
  try {
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const payload = JSON.parse(decodedJson);
    return payload.role || null;
  } catch {
    return null;
  }
}

// Configured to protect all portal routes
export const config = {
  matcher: [
    '/system-owner/:path*',
    '/admin/:path*',
    '/staff/:path*',
    '/voter/:path*',
    '/observer/:path*',
  ],
};
