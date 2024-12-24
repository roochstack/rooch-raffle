import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

// avoid error: Using Node.js Modules in Edge Runtime
import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk/dist/esm/client/networks';
import { routing } from './i18n/routing';

const apiDomains = [
  getRoochNodeUrl('localnet'),
  getRoochNodeUrl('devnet'),
  getRoochNodeUrl('testnet'),
  getRoochNodeUrl('mainnet'),
];
const isProduction = process.env.NODE_ENV === 'production';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  const response = await intlMiddleware(request);
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
    { name: 'frame-ancestors', values: ["'self'", '*'] },
    {
      name: 'connect-src',
      values: ["'self'", ...apiDomains],
    },
    { name: 'upgrade-insecure-requests', values: [] },
  ];

  const contentSecurityPolicyHeaderValue = csp
    .map((directive) => `${directive.name} ${directive.values.join(' ')}`)
    .join('; ');

  const responseHeaders = new Headers(response.headers);
  responseHeaders.set('x-nonce', nonce);
  responseHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue);

  const finalResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });

  return finalResponse;
}

export const config = {
  matcher: [
    '/(zh|en)/:path*',
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.webp).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
