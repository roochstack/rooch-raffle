import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

// avoid error: Using Node.js Modules in Edge Runtime
import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk/dist/esm/client/networks'
import { routing } from './i18n/routing'

const apiDomains = [getRoochNodeUrl('testnet')]
const isProduction = process.env.NODE_ENV === 'production'

// 创建国际化中间件
const intlMiddleware = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  // 先处理国际化
  const response = await intlMiddleware(request)

  // 添加 CSP 头
  const nonce = crypto.randomUUID().replace(/-/g, '')

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
  ]

  const contentSecurityPolicyHeaderValue = csp
    .map((directive) => `${directive.name} ${directive.values.join(' ')}`)
    .join('; ')

  // 将 headers 从响应复制到新的 headers 对象
  const responseHeaders = new Headers(response.headers)
  responseHeaders.set('x-nonce', nonce)
  responseHeaders.set('Content-Security-Policy', contentSecurityPolicyHeaderValue)

  // 创建新的响应，保留原始响应的所有属性
  const finalResponse = new NextResponse(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  })

  return finalResponse
}

export const config = {
  matcher: [
    // 国际化路由匹配
    '/(zh|en)/:path*',
    // 原有的 CSP 匹配规则
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
