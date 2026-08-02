import path from 'path'
import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  // Allow importing shared org config from the monorepo root (`config/org.ts`).
  turbopack: {
    root: path.join(__dirname, '..'),
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://cdn.sanity.io",
      "connect-src 'self' https://www.google-analytics.com https://*.sanity.io https://*.supabase.co",
      "font-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          {key: 'X-Frame-Options', value: 'DENY'},
          {key: 'X-Content-Type-Options', value: 'nosniff'},
          {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
          {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()'},
          {key: 'Content-Security-Policy', value: csp},
        ],
      },
    ]
  },
}

export default nextConfig
