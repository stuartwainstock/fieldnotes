/**
 * Canonical production origin for SEO surfaces (sitemap, robots, metadataBase).
 * Prefer an explicit NEXT_PUBLIC_SITE_URL; otherwise use Vercel's production
 * domain; fall back to the known deployment URL for local/preview builds.
 * Trailing slashes are always stripped so consumers can safely append paths.
 */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit) return explicit.replace(/\/+$/, '')

  const vercelProd = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelProd) return `https://${vercelProd}`

  return 'https://design-thinking-seven-mauve.vercel.app'
}
