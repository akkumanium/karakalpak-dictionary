import { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdictionary.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: [
      `${siteUrl}/sitemap/index.xml`,
      `${siteUrl}/sitemap/ru-kaa-0.xml`,
      `${siteUrl}/sitemap/ru-kaa-1.xml`,
      `${siteUrl}/sitemap/uz-kaa-0.xml`,
    ],
  }
}