import { MetadataRoute } from 'next'
import { generateSitemaps } from './sitemap'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://qqsozlik.com').replace(/\/$/, '')

export default async function robots(): Promise<MetadataRoute.Robots> {
  const sitemaps = await generateSitemaps()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: sitemaps.map(({ id }) => `${siteUrl}/sitemap/${id}.xml`),
  }
}