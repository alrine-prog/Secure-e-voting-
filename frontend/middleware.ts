import { NextRequest, NextResponse } from 'next/server';

const ROLE_PATHS: Array<[string, string[]]> = [
  ['/admin/university/pending', ['system_owner']],
  ['/system_owner', ['system_owner']],
  ['/system-owner', ['system_owner']],
  ['/admin', ['uni_admin', 'university_admin']],
  ['/staff', ['staff']],
  ['/voter', ['voter']],
  ['/observer', ['observer']],
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const match = ROLE_PATHS.find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!match) return NextResponse.next();

  const token = req.cookies.get('token')?.value;
  if (!token) {
    const login = new URL('/login', req.url);
    login.searchParams.set('role', match[1][0]);
    login.searchParams.set('from', pathname);
    return NextResponse.redirect(login);
  }

  const role = normalizeRole(getRole(token));
  if (!role || !match[1].some((allowedRole) => normalizeRole(allowedRole) === role)) {
    return NextResponse.redirect(new URL('/unauthorized', req.url));
  }
  return NextResponse.next();
}

function normalizeRole(role: string | null): string | null {
  if (role === 'university_admin') return 'uni_admin';
  return role;
}

function getRole(token: string): string | null {
  try {
    const encoded = token.split('.')[1];
    if (!encoded) return null;
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    return typeof payload.role === 'string' ? payload.role : null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ['/system_owner/:path*', '/system-owner/:path*', '/admin/:path*', '/staff/:path*', '/voter/:path*', '/observer/:path*'],
};
