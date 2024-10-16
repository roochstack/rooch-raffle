import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// avoid error: Using Node.js Modules in Edge Runtime
import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk/dist/esm/client/networks';

const apiDomains = [getRoochNodeUrl('testnet')];
const isProduction = process.env.NODE_ENV === 'production';

export function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, '');

  const csp = [
    { name: 'default-src', values: ["'self'"] },
    {
      name: 'script-src',
      values: isProduction
        ? ["'self'", `'nonce-${nonce}'`, "'strict-dynamic'"]
        : ["'self'", "'unsafe-eval'", "'unsafe-inline'"],
    },
    {
      name: 'style-src',
      values: ["'self'", "'unsafe-inline'"],
    },
    { name: 'img-src', values: ["'self'", 'data:', 'blob:', 'https:'] },
    { name: 'font-src', values: ["'self'", 'data:'] },
    { name: 'object-src', values: ["'none'"] },
    { name: 'base-uri', values: ["'self'"] },
    { name: 'form-action', values: ["'self'"] },
    { name: 'frame-ancestors', values: ["'none'"] },
    {
      name: 'connect-src',
      values: ["'self'", ...apiDomains],
    },
    { name: 'upgrade-insecure-requests', values: [] },
  ];

  const contentSecurityPolicyHeaderValue = csp
    .map((directive) => `${directive.name} ${directive.values.join(' ')}`)
    .join('; ');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};