import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/', // Example of a path you might want to hide
    },
    // This points to the main index file Next.js generates
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdictionary.com'}/sitemap.xml`,
  }
}